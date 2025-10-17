const { format, createLogger, transports } = require("winston");

const { LOG_LEVEL } = require("../../config");

//2025-10-15 00:00:000 INFO: [email: asdf] [location: asdf] [proc_type: asdf] [log: {}] bu şekilde bir loglama standartı oluşturacağız.
const formats = format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),    
    format.simple(),    
    format.splat(),     
    format.printf(info => `${info.timestamp} ${info.level.toUpperCase()}: [email:${info.message.email}] [location:${info.message.location}] [proc_type:${info.message.proc_type}] [log:${info.message.log}]`)    
);

const logger = createLogger({
    level: LOG_LEVEL,
    transports: [
        new transports.Console({ format: formats })
    ]
});

module.exports = logger;