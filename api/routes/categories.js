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
const excelExport = new (require("../lib/Export"));
const fs = require("fs");
const multer = require("multer");   //request ile gönderilen dosyayı import edebilmek için
const path = require('path');
const Import = new (require("../lib/Import"))();


let multerStorage = multer.diskStorage({
    destination: (req, file, next) => {
        next(null, config.FILE_UPLOAD_PATH)
    },
    filename: (req, file, next) => {
        next(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({storage: multerStorage}).single("pb_file");

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

router.post("/export", auth.checkRoles("category_export"), async(req, res) => {
  try {
    let categories = await Categories.find({});

    let excel = excelExport.toExcel(
      ["NAME", "IS ACTIVE", "USER ID", "CREATED AT", "UPDATED AT"],
      ["name", "is_active", "created_by", "created_at", "updated_at"],
      categories
    );
    
    let filePath = __dirname+"/../tmp/categories_excel_"+Date.now()+".xlsx";
    fs.writeFileSync(filePath, excel, "utf-8");
    res.download(filePath, (err) => {
      if (err){
        //Logging
        AuditLogs.info(req.user?.email, "Categories", "export", { message: `Download error! ${err}` });
        logger.info(req.user?.email, "Categories", "export", { message: `Download error! ${err}` });
      }

      /** İndirme işlemi tamamlanınca dosyayı tmp'den sil. */
      fs.unlink(filePath, (unlinkErr) => {
        if(unlinkErr) 
        {           
          //Logging
          AuditLogs.info(req.user?.email, "Categories", "export", { message: `Dosya tmp den silinirken bir sorun oluştu! ${unlinkErr}` });
          logger.info(req.user?.email, "Categories", "export", { message: `Dosya tmp den silinirken bir sorun oluştu! ${unlinkErr}` });
        }
        else 
        { 
          //Logging
          AuditLogs.info(req.user?.email, "Categories", "export", { message: `Dosya tmp den başarıyla indirildi.` });
          logger.info(req.user?.email, "Categories", "export", { message: `Dosya tmp den başarıyla indirildi.` });          
        }
      })
    });

    //fs.unlinkSync(filePath);

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(Response.errorResponse);
  }
})

router.post("/import", auth.checkRoles("category_add"), upload, async (req, res) => {
  try {
    
    let file = req.file;
    let body = req.body;

    let rows = Import.fromExcel(file.path);

    for(let i=1; i<rows.length; i++)
    {
      let [name, is_active, user, created_at, updated_at] = rows[i];

      if (name){
        await Categories.create({
          name,
          is_active,
          created_by: req.user_id
        });
      }
      
    }

    res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse(req.body, Enum.HTTP_CODES.CREATED));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(Response.errorResponse);
  }
})

module.exports = router;
