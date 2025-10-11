var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt-nodejs');
const is = require('is_js');
const { parsePhoneNumberFromString } = require('libphonenumber-js');

const Users = require('../db/models/Users');
const Response = require('../lib/Response');
const Enum = require('../config/Enum');
const CustomError = require('../lib/Error');

/* GET users listing. */
router.get('/', async(req, res, next) => {
  try{
    let users = await Users.find({});

    res.json(Response.successResponse(users));
  } catch(err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post('/add', async(req, res) => {
  try {
    let body = req.body;
    let phoneNumber;

    if(!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "email field must be filled.");
    if(is.not.email(body.email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "email field must be an email format.");
    if(!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "password field must be filled.");
    if(!body.adres) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "adres field must be filled.");
    if(!body.tc_no) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "tc_no field must be filled.");
    if(body.password.length < Enum.PASSWORD_LENGTH){
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "password length must be greater than" + Enum.PASSWORD_LENGTH);
    }
    if(body.phone_number)
    {
      phoneNumber = parsePhoneNumberFromString(body.phone_number, 'TR');
      if(!phoneNumber || !phoneNumber.isValid()) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "phone_number field must be a phone number. (+90 0555 555 55 55)");
    }
    if(body.tc_no && body.tc_no.length != "11") throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "The length of the tc_no field must be 11 characters.");

    let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(Enum.PASSWORD_LENGTH));

    await Users.create({
      email: body.email,
      password, //key ve value aynı isimlendirme ise bu şekilde kullanılabiliyor. (let password'u kullanacak)
      is_active: body.is_active? body.is_active : true,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: phoneNumber ? phoneNumber.number : "",
      tc_no: body.tc_no,
      yas: body.yas? body.yas : "",
      adres: body.adres
    });

    res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.put('/update', async(req, res) => {
  try {
    let body = req.body;
    let phoneNumber;
    let updates = {};

    if(!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled.");
    if(body.password && body.password.length >= Enum.PASSWORD_LENGTH )
    {
      updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);
    }
    if(body.first_name) updates.first_name = body.first_name;
    if(body.last_name) updates.last_name = body.last_name;
    if(body.email && is.email(body.email)) updates.email = body.email;
    if(typeof(body.is_active) === 'boolean') updates.is_active = body.is_active;
    if(body.tc_no && body.tc_no.length == "11") updates.tc_no = body.tc_no;
    if(body.yas) updates.yas = body.yas;
    if(body.adres) updates.adres = body.adres;
    if(body.phone_number)
    {
      phoneNumber = parsePhoneNumberFromString(body.phone_number, 'TR');
      if(!phoneNumber || !phoneNumber.isValid()) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "phone_number field must be a phone number. (+90 0555 555 55 55)");
      updates.phone_number = phoneNumber.number.toString();
    }

    await Users.updateOne({ _id: body._id }, updates);
    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.delete('/delete', async(req, res) => {
  try {
    let body = req.body;

    if(!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled.");

    await Users.deleteOne({ _id: body._id });

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
})
module.exports = router;
