var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt-nodejs');
const is = require('is_js');
const { parsePhoneNumberFromString } = require('libphonenumber-js');

const Users = require('../db/models/Users');
const UserRoles = require('../db/models/UserRoles');
const Roles = require('../db/models/Roles');
const Response = require('../lib/Response');
const Enum = require('../config/Enum');
const CustomError = require('../lib/Error');
const AuditLogs = require('../lib/AuditLogs');
const logger = require("../lib/logger/LoggerClass");
const config = require("../config");
const jwt = require("jsonwebtoken");
const auth = require("../lib/auth")();
const i18n = new (require("../lib/i18n"))(config.DEFAULT_LANG);

// register ve auth endpointlerinin authenticate ile korunmaması gerekiyor. Bu yüzden yukarı alındı.
router.post('/register', async(req, res) => {
  try {
    let role = await Roles.findOne({ role_name: Enum.SUPER_ADMIN });
    let users = await Users.findOne({});
    if(users)
    {
      return res.sendStatus(Enum.HTTP_CODES.NOT_FOUND);
    }

    let body = req.body;
    let phoneNumber;

    if(!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["email"]));
    if(is.not.email(body.email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_EMAIL_FORMAT", req.user?.language, ["email"]));
    if(!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["password"]));
    if(!body.address) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["address"]));
    if(!body.identity_number) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["identity_number"]));
    if(body.password.length < Enum.PASSWORD_LENGTH){
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.INVALID_PASSWORD", req.user?.language, ["password"]));
    }
    if(body.phone_number)
    {
      phoneNumber = parsePhoneNumberFromString(body.phone_number, 'TR');
      if(!phoneNumber || !phoneNumber.isValid()) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.INVALID_PHONE_NUMBER", req.user?.language, ["phone_number"]));
    }
    if(body.identity_number && body.identity_number.length != "11") throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.INVALID_FIELD_CHARACTERS", req.user?.language, ["identity_number", "11"]));

    let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(Enum.PASSWORD_LENGTH));

    let createdUser = await Users.create({
      email: body.email,
      password, //key ve value aynı isimlendirme ise bu şekilde kullanılabiliyor. (let password'u kullanacak)
      is_active: body.is_active? body.is_active : true,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: phoneNumber ? phoneNumber.number : "",
      identity_number: body.identity_number,
      age: body.age? body.age : "",
      address: body.address
    });

    if (!role)
    {
      role = await Roles.create({
        role_name: Enum.SUPER_ADMIN,
        is_active: true,
        created_by: createdUser._id
      });
    }

    await UserRoles.create({
      role_id: role._id,
      user_id: createdUser._id
    });

    //Logging
    AuditLogs.info(req.user?.email, "Users", "register", createdUser);
    logger.info(req.user?.email, "Users", "register", createdUser);
    res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED));

  } catch (err) {
    logger.info(req.user?.email, "Users", "register", err);
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post('/auth', async(req, res) => {
  try {
    let { email, password } = req.body;
    
    Users.validateFieldsBeforeAuth(email, password);  //Bu metot Users model içerisinde tanımlandı.
    
    let user = await Users.findOne({ email });

    if (!user)
    {
      throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.WRONG_EMAIL_OR_PASSWORD", req.user?.language));
    }
    
    if(!user.validPassword(password)) //Bu metot Users model içerisinde tanımlandı.
    {
      throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.WRONG_EMAIL_OR_PASSWORD", req.user?.language));
    }

    const token = jwt.sign(
      { id: user._id },
      config.JWT.SECRET,
      { expiresIn: config.JWT.EXPIRE_TIME } // saniye veya '1h' olarak çalışır
    );

    res.json(Response.successResponse({
      token,
      user: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name
      }
    }));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.all("*", auth.authenticate(), (req, res, next) => {
    next();
});

router.get('/', auth.checkRoles("user_view"), async(req, res) => {
  try{
    let users = await Users.find({});

    res.json(Response.successResponse(users));
  } catch(err) {
    logger.info(req.user?.email, "Users", "get", err);
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post('/add', auth.checkRoles("user_add"), async(req, res) => {
  try {
    let body = req.body;
    let phoneNumber;

    if(!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["email"]));
    if(is.not.email(body.email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_EMAIL_FORMAT", req.user?.language, ["email"]));
    if(!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["password"]));
    if(!body.address) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["address"]));
    if(!body.identity_number) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["identity_number"]));
    if(body.password.length < Enum.PASSWORD_LENGTH){
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.INVALID_PASSWORD", req.user?.language, ["password"]));
    }
    if(body.phone_number)
    {
      phoneNumber = parsePhoneNumberFromString(body.phone_number, 'TR');
      if(!phoneNumber || !phoneNumber.isValid()) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.INVALID_PHONE_NUMBER", req.user?.language, ["phone_number"]));
    }
    if(body.identity_number && body.identity_number.length != "11") throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.INVALID_FIELD_CHARACTERS", req.user?.language, ["identity_number", "11"]));
    if(!body.roles || !Array.isArray(body.roles) || body.roles.length == 0) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["roles"]));

    let roles = await Roles.find({ _id: {$in: body.roles} });
    if(roles.length == 0) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_ARRAY", req.user?.language, ["roles"]));

    let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(Enum.PASSWORD_LENGTH));

    let createdUser = await Users.create({
      email: body.email,
      password, //key ve value aynı isimlendirme ise bu şekilde kullanılabiliyor. (let password'u kullanacak)
      is_active: body.is_active? body.is_active : true,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: phoneNumber ? phoneNumber.number : "",
      identity_number: body.identity_number,
      age: body.age? body.age : "",
      address: body.address
    });

    for (let i=0;i<roles.length;i++)
    {
      await UserRoles.create({
        role_id: roles[i],
        user_id: createdUser._id
      })
    }

    //Logging
    AuditLogs.info(req.user?.email, "Users", "add", createdUser);
    logger.info(req.user?.email, "Users", "add", createdUser);

    res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED));
  } catch (err) {
    logger.info(req.user?.email, "Users", "add", err);
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.put('/update', auth.checkRoles("user_update"), async(req, res) => {
  try {
    let body = req.body;
    let phoneNumber;
    let updates = {};

    if(!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["_id"]));
    if(body.password && body.password.length >= Enum.PASSWORD_LENGTH )
    {
      updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);
    }
    if(body.first_name) updates.first_name = body.first_name;
    if(body.last_name) updates.last_name = body.last_name;
    if(body.email && is.email(body.email)) updates.email = body.email;
    if(typeof(body.is_active) === 'boolean') updates.is_active = body.is_active;
    if(body.identity_number && body.identity_number.length == "11") updates.identity_number = body.identity_number;
    if(body.age) updates.age = body.age;
    if(body.address) updates.address = body.address;
    if(body.phone_number)
    {
      phoneNumber = parsePhoneNumberFromString(body.phone_number, 'TR');
      if(!phoneNumber || !phoneNumber.isValid()) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.INVALID_PHONE_NUMBER", req.user?.language, ["phone_number"]));
      updates.phone_number = phoneNumber.number.toString();
    }
    if(Array.isArray(body.roles) && body.roles.length > 0) 
    {
      let userRoles = await UserRoles.find({ user_id: body._id });

      let removedRoles = userRoles.filter(x => !body.roles.includes(x.role_id));
      let newRoles = body.roles.filter(x => !userRoles.map(r => r.role_id).includes(x));

      if(removedRoles.length > 0)
      {
        await UserRoles.deleteMany({_id: {$in: removedRoles.map(x => x._id.toString())}});
      }

      if(newRoles.length > 0)
      {
        for(let i=0; i<newRoles.length;i++)
        {
          let userRole = new UserRoles({
            role_id: newRoles[i],
            user_id: body._id
          });

          await userRole.save();
        }
      }
    }

    await Users.updateOne({ _id: body._id }, updates);

    //Logging
    AuditLogs.info(req.user?.email, "Users", "update", { _id: body._id, ...updates });
    logger.info(req.user?.email, "Users", "update", { _id: body._id, ...updates });

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    logger.info(req.user?.email, "Users", "update", err);
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.delete('/delete', auth.checkRoles("user_delete"), async(req, res) => {
  try {
    let body = req.body;

    if(!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["_id"]));

    await Users.deleteOne({ _id: body._id });

    await UserRoles.deleteMany({ user_id: body._id });

    //Logging
    AuditLogs.info(req.user?.email, "Users", "delete", { _id: body._id });
    logger.info(req.user?.email, "Users", "delete", { _id: body._id });

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    logger.info(req.user?.email, "Users", "delete", err);
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

module.exports = router;
