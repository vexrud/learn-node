if (process.env.NODE_ENV != "production")
{
  // Bu if bloğunda .env dosyası içerisinde tanımlanan environments (çevre değişkenlerini) projenin "production" sürümü haricinde yakalaması için koşulladık.
  const config = require('dotenv').config(); // .env dosyası içerisindeki environments değişkenlerin yakalanmasını sağlar.
  console.log("ENV", config);
}

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Bu alanın Middleware olduğunu ispatlamak için kullanıldı.
// app.use((res, req, next) => {
//   console.log("Ben app.js üzerinde tanımlanan bir middleware'im.");
//   next();
// });

// routings
app.use('/api', require('./routes/index'));  //http://localhost:3000
// Aşağıdaki router yapılanmaları dinamik routing kullanıldığı için yorum satırı olarak kapatıldı.
// app.use('/users', require('.//routes/users')); //http://localhost:3000/users
// app.use('/auditlogs', require('.//routes/auditlogs'));  //http://localhost:3000/auditlogs


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
