var express = require('express');
var router = express.Router();

// const config = require("../config");  //config klasörü altındaki index dosyası içerisindeki environments tanımlamaları al (dotenv kütüphanesi kullanılmadan manuel tanımlama ve yakalama işlemi yaptık)

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Batuhan' });
  // res.render('index', { title: 'Batuhan', config }); // environments değişkenlerin aktif olarak kullanımını ekran üzerinde görmek için config parametresinin eklenmiş halidir
});

module.exports = router; 
