var express = require('express');
var router = express.Router();
const Categories = require("../db/models/Categories");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");
const AuditLogs = require("../lib/AuditLogs");
const logger = require("../lib/logger/LoggerClass");
const auth = require("../lib/auth")();
const config = require("../config");
const i18n = new (require("../lib/i18n"))(config.DEFAULT_LANG);
const emitter = require("../lib/Emitter");

//const isAuthenticated = false;
/**
 * Create
 * Read
 * Update
 * Delete
 * CRUD Operations
 */

/**
 * simple authentication demo (pseudo code)
  router.all("*", (req, res, next) => {
    if (isAuthenticated){
      next();
    }
    else {
      res.json({ success: false, error: "Not authenticated."})
    }
  })
 */

router.all("*", auth.authenticate(), (req, res, next) => {
    next();
});

/* GET categories listing. */
router.get('/', auth.checkRoles("category_view"), async (req, res) => {
  try {
    let categories = await Categories.find({}); //Select sorgusu (veritabanındaki categories tablosundan verileri çekiyor)
    
    res.json(Response.successResponse(categories));
  } catch (err) {
    logger.error(req.user?.email, "Categories", "get", err);
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});


router.post('/add', auth.checkRoles("category_add"), async (req, res) => {
  let body = req.body;
  try {
    if (!body.name)
    {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.lang), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["name"]));  //name filled must be filled.
    }

    let category = new Categories({
      name: body.name,
      is_active: true,
      created_by: req.user?.id //Şuan bu alan yok çünkü authentication eklenmedi.
    });

    await category.save();

    //Logging
    AuditLogs.info(req.user?.email, "Categories", "add", category);
    logger.info(req.user?.email, "Categories", "add", category);
    
    //Notification Emitter fırlatmak
    emitter.getEmitter("notifications").emit("messages", { message: category.name+" is added." });

    res.json(Response.successResponse({ success: true }));

  } catch (err) {
    logger.error(req.user?.email, "Categories", "add", err);
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.put('/update', auth.checkRoles("category_update"), async(req, res) => {
  let body = req.body;
  try {
    let updates = {};

    if (!body._id){
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["_id"]));
    }
    if (body.name){
      updates.name = body.name;
    }
    if (typeof body.is_active === "boolean"){
      updates.is_active = body.is_active;
    }

    updates.updated_at = new Date();
    
    await Categories.updateOne({ _id: body._id }, updates);

    //Logging
    AuditLogs.info(req.user?.email, "Categories", "update", { _id: body._id, ...updates });
    logger.info(req.user?.email, "Categories", "update", { _id: body._id, ...updates });

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    logger.error(req.user?.email, "Categories", "update", err);
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
})

router.delete('/delete', auth.checkRoles("category_delete"), async(req, res) => {
  let body = req.body;

  try {
    if (!body._id){
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["_id"]));
    }

    await Categories.deleteOne({_id: body._id});

    //Logging
    AuditLogs.info(req.user?.email, "Categories", "delete", { _id: body._id });
    logger.info(req.user?.email, "Categories", "delete", { _id: body._id });

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    logger.error(req.user?.email, "Categories", "delete", err);
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
})

module.exports = router;
