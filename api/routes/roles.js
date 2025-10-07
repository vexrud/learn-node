var express = require('express');
var router = express.Router();
const Roles = require("../db/models/Roles");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");
const role_privileges = require("../config/role_privileges");
const RolePrivileges = require("../db/models/RolePrivileges");

/* GET roles listing. */
router.get('/', async (req, res, next) => {
  try {
    let roles = await Roles.find({}); //Select query
    
    res.json(Response.successResponse(roles));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }

});

router.post('/add', async (req, res) => {
  let body = req.body;
  try {
    if (!body.role_name)
    {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "role_name field must be filled.");
    }
    
    if (!body.permissions || !Array.isArray(body.permissions) || body.permissions.length == 0)  //Request içerisinde permissions alanı yoksa veya var ama bir array olarak tanımlı değil ise hata fırlat
    {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "permissions field must be an Array.");
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
    
    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.put('/update', async(req, res) => {
  let body = req.body;
  try {
    let updates = {};
    if (!body._id){
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled.");
    }
    if (body.role_name)
    {
      updates.role_name = body.role_name;
    }
    if (typeof body.is_active === "boolean")
    {
      updates.is_active = body.is_active;
    }
    if (body.permissions && Array.isArray(body.permissions) && body.permissions.length > 0)  //Request içerisinde permissions alanı yoksa veya var ama bir array olarak tanımlı değil ise hata fırlat
    {
      let permissions = await RolePrivileges.find({role_id: body._id});

      //body.permissions => ["category_view", "user_add"]
      //permissions => [{role_id: "abc", permission: "user_add"}]

      let removedPermissions = permissions.filter(x => !body.permissions.includes(x.permission)); 
      let newPermissions = body.permissions.filter(x => !permissions.map(p => p.permission).includes(x));

      if (removedPermissions.length > 0)
      {
        await RolePrivileges.deleteOne({_id: {$in:[removedPermissions.map(x => x._id)]}}); //removedPermissions içerisindeki _id değerlerini bir kerede verip eşleşenleri silmesini söylüyoruz.
      }

      if (newPermissions.length > 0)
      {
        for (let i=0;i<newPermissions.length;i++)
        {
          let priv = new RolePrivileges({
            role_id: role._id,
            permission: newPermissions[i],
            created_by: req.user?.id
          });

          await priv.save();
        }          
      }  
    }

    updates.updated_at = new Date();

    await Roles.updateOne({ _id: body._id }, updates);
    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.delete('/delete', async(req, res) => {
  let body = req.body;
  try {
    if (!body._id)
    {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field musst be filled.");
    }

    await Roles.deleteOne({ _id: body._id });

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.get('/role_privileges', async(req, res) => {
  res.json(Response.successResponse({ role_privileges }));
});

module.exports = router;
