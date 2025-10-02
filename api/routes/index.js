var express = require('express');
var router = express.Router();
const config = require("../config");  //config klasörü altındaki index dosyası içerisindeki environments tanımlamaları al (dotenv kütüphanesi kullanılmadan manuel tanımlama ve yakalama işlemi yaptık)

// dinamik router yapılanması
const fs = require("fs"); // Bu kütüphane build-in geliyor

let routes = fs.readdirSync(__dirname); // Bulunduğumuz "routes" klasörünü oku

for (let route of routes){
  if (route.includes(".js") && route != "index.js") // dosyalar içerisinde uzantısı .js olanları oku ama aynı zamanda bu index.js dışındaki bir dosya olmalı
  {
    router.use("/" + route.replace(".js",""), require("./" + route));  // router'ı kullanarak gelen dosya ismini sonundaki uzantısı olmadan yönlendirme yap 
    // (böylelikle routes klasörü içerisinde tanımlanan .js dosyalarını dinamik olarak yönlendirme yapacaktır.)
  }
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Batuhan', config })
});

module.exports = router; 
