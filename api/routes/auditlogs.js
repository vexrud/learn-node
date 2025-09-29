const express = require("express");
const router = express.Router();

//get endpoint
//parameters : request, response and next
router.get("/:id", (req, res, next) => {
    res.json({
        body: req.body,
        params: req.params,
        query: req.query,
        headers: req.headers
    });
})

module.exports = router;