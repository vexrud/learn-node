const Enum = require("../config/Enum");
const CustomError = require("./Error");
const config = require("../config");
const i18n = new (require("./i18n"))(config.DEFAULT_LANG); 


/** Endpoint (API)'lerde standart bir response yapısı oluşturulması amacıyla Response class'ı oluşturulmuştur. */
class Response {
    constructor() {}

    static successResponse(data, code = 200) {
        return {
            code,
            data
        }
    }

    static errorResponse(error, lang) {
        // Özel olarak oluşturulmuş hatalar (CustomError)
        if (error instanceof CustomError) {
            return {
                code: error.code,
                error: {
                    message: error.message,
                    description: error.description
                }
            };
        }

        // 🔁 MongoDB Duplicate Key hatası (örneğin benzersiz email vs.)
        else if (error.message.includes("E11000")) {
            return {
                code: Enum.HTTP_CODES.CONFLICT,
                error: {
                    message: error.message,
                    description: i18n.translate("COMMON.ALREADY_EXISTS", lang),                    
                }
            };
        }

        // ⚙️ Mongoose Validation hatası (örneğin required alan eksik)
        else if (error.name === "ValidationError") {
            const details = Object.values(error.errors).map(e => e.message);
            return {
                code: Enum.HTTP_CODES.BAD_REQUEST,
                error: {
                    message: details.join(", "),
                    description: i18n.translate("COMMON.VALIDATION_ERROR", lang),                    
                }
            };
        }

        // 🆔 Cast Error (örneğin geçersiz ObjectId formatı)
        else if (error.name === "CastError") {
            return {
                code: Enum.HTTP_CODES.BAD_REQUEST,
                error: {
                    message: `${error.path}: ${error.value}`,
                    description: i18n.translate("COMMON.INVALID_ID", lang),                    
                }
            };
        }

        // 🔐 Token hataları (örneğin süresi geçmiş veya geçersiz JWT)
        else if (error.name === "TokenExpiredError") {
            return {
                code: Enum.HTTP_CODES.UNAUTHORIZED,
                error: {
                    message: error.message,
                    description: i18n.translate("COMMON.TOKEN_EXPIRED", lang),                    
                }
            };
        }

        else if (error.name === "JsonWebTokenError") {
            return {
                code: Enum.HTTP_CODES.UNAUTHORIZED,
                error: {
                    message: error.message,
                    description: i18n.translate("COMMON.INVALID_TOKEN", lang),                    
                }
            };
        }

        // 🌐 Ağ veya bağlantı hataları (örneğin MongoDB bağlantısı koptu)
        else if (error.name === "MongoNetworkError") {
            return {
                code: Enum.HTTP_CODES.SERVICE_UNAVAILABLE,
                error: {
                    message: error.message,                    
                    description: i18n.translate("COMMON.DATABASE_UNAVAILABLE", lang),                    
                }
            };
        }

        // ❌ Body veya JSON parse hatası
        else if (error.type === "entity.parse.failed") {
            return {
                code: Enum.HTTP_CODES.BAD_REQUEST,
                error: {
                    message: error.message,
                    description: i18n.translate("COMMON.INVALID_JSON", lang),                    
                }
            };
        }

        // 🧱 Bilinmeyen veya yakalanmamış hatalar
        return {
            code: Enum.HTTP_CODES.INTERNAL_SERVER_ERROR,
            error: {
                message: error.message || "Unexpected error occurred.",
                description: i18n.translate("COMMON.UNKNOWN_ERROR", lang),                
            }
        };
    }
}

module.exports = Response;
//module.exports = new Response();