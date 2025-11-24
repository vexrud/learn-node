const express = require("express");
const router = express.Router();
const auth = require("../lib/auth")();
const Response = require("../lib/Response");
const AuditLogs = require("../db/models/AuditLogs");
const Categories = require("../db/models/Categories");
const Users = require("../db/models/Users");


router.all("*", auth.authenticate(), (req, res, next) => {
    next();
});

/** 
 * TODO: Yapılacak istatistiksel işlemler
 * 1.AuditLogs tablosunda işlem yapan kişilerin hangi tip işlemi kaç kez yaptığını veren bir sorgu
 * 2.Kategori tablosunda tekil veri sayısı (Kaç tane tekil kategori var.)
 * 3.Sistemde tanımlı kaç kullanıcı var.
 * /api/stats/auditlogs
 */

router.post("/auditlogs", async(req, res) => {
    try {
        let body = req.body;
        let filter = {};

        if (typeof body.location === "string") filter.location = body.location

        //aggregate fonksiyonu sql tarafında join işlemine karşılık gelen bir yapı gibi düşünebiliriz.
        let result = await AuditLogs.aggregate([
            {$match: filter},
            {$group: {_id: {email: "$email", proc_type: "$proc_type"}, count: {$sum: 1}}},
            {$sort: {count: -1}}
        ]);

        res.json(Response.successResponse(result));

    } catch (err) {
        let errorResponse = Response.errorResponse(err, req.user?.language);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.post("/categories/unique", async(req, res) => {
    try {
        let body = req.body;
        let filter = {};

        if(typeof body.is_active === "boolean") filter.is_active = body.is_active;

        let result = await Categories.distinct("name", filter);

        res.json(Response.successResponse({result, count: result.length}));
    } catch (err) {
        let errorResponse = Response.errorResponse(err, req.user?.language);
        res.status(errorResponse.code).json(errorResponse);
    }
});


router.post("/users/count", async(req, res) => {
    try {
        let body = req.body;
        let filter = {};

        if (typeof body.is_active === "boolean") filter.is_active = body.is_active;

        let result = await Users.countDocuments(filter);

        res.json(Response.successResponse(result));
    } catch (err) {
        let errorResponse = Response.errorResponse(err, req.user?.language);
        res.status(errorResponse.code).json(errorResponse);
    }
});

module.exports = router;