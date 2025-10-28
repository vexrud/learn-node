var express = require('express');
var router = express.Router();
const Roles = require("../db/models/Roles");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");
const role_privileges = require("../config/role_privileges");
const RolePrivileges = require("../db/models/RolePrivileges");
const AuditLogs = require('../lib/AuditLogs');
const logger = require("../lib/logger/LoggerClass");
const auth = require("../lib/auth")();
const config = require("../config");
const i18n = new (require("../lib/i18n"))(config.DEFAULT_LANG);

router.all("*", auth.authenticate(), (req, res, next) => {
    next();
});

/* GET roles listing. */
router.get('/', auth.checkRoles("role_view"), async (req, res) => {
  try {
    let roles = await Roles.find({}); //Select query
    
    res.json(Response.successResponse(roles));
  } catch (err) {
    logger.error(req.user?.email, "Roles", "get", err);
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }

});

router.post('/add', auth.checkRoles("role_add"), async (req, res) => { 
  try {
    let body = req.body;
    
    if (!body.role_name)
    {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["role_name"]));
    }
    
    if (!body.permissions || !Array.isArray(body.permissions) || body.permissions.length == 0)  //Request içerisinde permissions alanı yoksa veya var ama bir array olarak tanımlı değil ise hata fırlat
    {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR"), i18n.translate("COMMON.FIELD_MUST_BE_ARRAY", req.user?.language, ["permissions"]));
    }
    
    let role = new Roles({
      role_name: body.role_name,
      is_active: true,
      created_by: req.user?.id 
    });

    await role.save();

    for (let i=0;i<body.permissions.length;i++)
    {
      let priv = new RolePrivileges({
        role_id: role._id,
        permission: body.permissions[i],
        created_by: req.user?.id
      });

      await priv.save();
    }

    //Logging
    AuditLogs.info(req.user?.email, "Roles", "add", role);
    logger.info(req.user?.email, "Roles", "add", role);    
    
    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    logger.info(req.user?.email, "Roles", "add", err);
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.put('/update', auth.checkRoles("role_update"), async(req, res) => {

  try {
    let body = req.body;
    let updates = {};
    
    if (!body._id)
    {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["_id"]));
    }
    
    if (body.role_name)
    {
      updates.role_name = body.role_name;
    }
    if (typeof body.is_active === "boolean")
    {
      updates.is_active = body.is_active;
    }
    if (body.permissions && Array.isArray(body.permissions) && body.permissions.length > 0) 
    {
      let permissions = await RolePrivileges.find({role_id: body._id});

      //body.permissions => ["category_view", "user_add"]
      //permissions => [{role_id: "abc", permission: "user_add"}]

      let removedPermissions = permissions.filter(x => !body.permissions.includes(x.permission)); 
      let newPermissions = body.permissions.filter(x => !permissions.map(p => p.permission).includes(x));

      if (removedPermissions.length > 0)
      {
        await RolePrivileges.deleteMany({_id: {$in:[removedPermissions.map(x => x._id)]}}); //removedPermissions içerisindeki _id değerlerini bir kerede verip eşleşenleri silmesini söylüyoruz.
      }

      if (newPermissions.length > 0)
      {
        for (let i=0;i<newPermissions.length;i++)
        {
          let priv = new RolePrivileges({
            role_id: body._id,
            permission: newPermissions[i],
            created_by: req.user?.id
          });

          await priv.save();
        }          
      }  
    }

    updates.updated_at = new Date();

    //Logging
    AuditLogs.info(req.user?.email, "Roles", "update", { _id: body._id, ...updates });
    logger.info(req.user?.email, "Roles", "update", { _id: body._id, ...updates });

    await Roles.updateOne({ _id: body._id }, updates);
    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    logger.info(req.user?.email, "Roles", "update", err);
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.delete('/delete', auth.checkRoles("role_delete"), async(req, res) => {
  let body = req.body;
  try {
    if (!body._id)
    {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["_id"]));
    }

    await Roles.deleteOne({ _id: body._id });

    //Logging
    AuditLogs.info(req.user?.email, "Roles", "delete", { _id: body._id });
    logger.info(req.user?.email, "Roles", "delete", { _id: body._id });

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    //Logging
    logger.info(req.user?.email, "Roles", "delete", err);
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.get('/role_privileges', async(req, res) => {
  res.json(Response.successResponse({ role_privileges }));
});

module.exports = router;
