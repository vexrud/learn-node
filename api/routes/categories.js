var express = require('express');
var router = express.Router();
const Categories = require("../db/models/Categories");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");

const isAuthenticated = false;
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

/* GET categories listing. */
router.get('/', async (req, res, next) => {
  try {
    let categories = await Categories.find({}); //Select sorgusu (veritabanındaki categories tablosundan verileri çekiyor)
    
    res.json(Response.successResponse(categories));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});


router.post("/add", async (req, res) => {
  let body = req.body;
  try {
    if (!body.name)
    {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Name field must be filled.");
    }

    let category = new Categories({
      name: body.name,
      is_active: true,
      created_by: req.user?.id //Şuan bu alan yok çünkü authentication eklenmedi.
    });

    await category.save();

    res.json(Response.successResponse({ success: true }));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.put("/update", async(req, res) => {
  let body = req.body;
  try {
    let updates = {};

    if (!body._id){
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled.");
    }
    if (body.name){
      updates.name = body.name;
    }
    if (typeof body.is_active === "boolean"){
      updates.is_active = body.is_active;
    }

    updates.updated_at = new Date();
    
    await Categories.updateOne({ _id: body._id }, updates);
    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
})

router.delete('/delete', async(req, res) => {
  let body = req.body;

  try {
    if (!body._id){
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled.");
    }

    await Categories.deleteOne({_id: body._id});
    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
})

module.exports = router;
