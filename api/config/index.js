module.exports = {
    "PORT": process.env.PORT || "3000",
    "LOG_LEVEL": process.env.LOG_LEVEL || "debug",
    "CONNECTION_STRING": process.env.CONNECTION_STRING || "mongodb://localhost:27017/user_panel_application",
    "JWT" : { 
        "SECRET" : "123456",
        "EXPIRE_TIME" : "1h"    //token'ın geçerlilik süresi 1 saat
        //"EXPIRE_TIME": !isNaN(parseInt(process.env.TOKEN_EXPIRE_TIME)) ? parseInt(process.env.TOKEN_EXPIRE_TIME) : 24*60*60 //86400
    },
    "DEFAULT_LANG": process.env.DEFAULT_LANG || "EN"
}