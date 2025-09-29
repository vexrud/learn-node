var express = require('express');
var router = express.Router();

const isAuthenticated = false;

// simple authentication demo
router.all("*", (req, res, next) => {
  if (isAuthenticated){
    next();
  }
  else {
    res.json({ success: false, error: "Not authenticated."})
  }
})

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send({ success: true });
});

module.exports = router;
