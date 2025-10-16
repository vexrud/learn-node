const AuditLogsModel = require("../db/models/AuditLogs");
const Enum = require("../config/Enum");

let instance = null;

class AuditLogs{
    constructor()
    {
        if(!instance)
        {
            instance = this;
        }
        return instance;
    }

    //Biz bu class içerisindeki info, warn, error, debug ... gibi log level metotlarına erişim sağlayacağız.
    //Asıl olan saveToDB metotu dışarıya private yaparak tanımlanmış olan log level haricinde işlem yapılmasını engelliyoruz. ve daha güvenli

    info(email, location, proc_type, log)
    {
        this.#saveToDB({
            level: Enum.LOGLEVELS.INFO,
            email,
            location,
            proc_type,
            log
        });
    }

    warn(email, location, proc_type, log)
    {
        this.#saveToDB({
            level: Enum.LOGLEVELS.WARN,
            email,
            location,
            proc_type,
            log
        });
    }

    error(email, location, proc_type, log)
    {
        this.#saveToDB({
            level: Enum.LOGLEVELS.ERROR,
            email,
            location,
            proc_type,
            log
        });
    }

    debug(email, location, proc_type, log)
    {
        this.#saveToDB({
            level: Enum.LOGLEVELS.DEBUG,
            email,
            location,
            proc_type,
            log
        });
    }

    verbose(email, location, proc_type, log)
    {
        this.#saveToDB({
            level: Enum.LOGLEVELS.VERBOSE,
            email,
            location,
            proc_type,
            log
        });
    }

    http(email, location, proc_type, log)
    {
        this.#saveToDB({
            level: Enum.LOGLEVELS.HTTP,
            email,
            location,
            proc_type,
            log
        });
    }

    #saveToDB({level, email, location, proc_type, log})     //#saveToDB() private olarak tanımlama
    {   
        //await yazarsak her loglama esnasında veritabanına bekleme işlemi olacak ve bu uygulamanın yavaşlamasına sebep olacaktır.
        AuditLogsModel.create({
            level,
            email,
            location,
            proc_type,
            log
        });
    }
}

module.exports = new AuditLogs();