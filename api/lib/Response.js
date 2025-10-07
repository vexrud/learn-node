const Enum = require("../config/Enum");
const CustomError = require("./Error");

/** Endpoint (API)'lerde standart bir response yapısı oluşturulması amacıyla Response class'ı oluşturulmuştur. */
class Response {
    constructor() {}

    static successResponse(data, code = 200) {
        return {
            code,
            data
        }
    }

    static errorResponse(error) {
        if (error instanceof CustomError){
            return {
                code: error.code,
                error: {
                    message: error.message,
                    description: error.description
                }
            }
        }
        else if (error.message.includes("E11000"))  //Veritabanında zaten varolan bir kayıt için E11000 kodunda bir mesaj geliyordu bunu kullanıcı dostu olması adına message kısmını düzenlemek için bu şekilde koşul ekledik.
        {
            return {
                code: Enum.HTTP_CODES.CONFLICT,
                error: {
                    message: "Alread Exists!",
                    description: "This record already exists."
                }
            }            
        }

        return {
            code: Enum.HTTP_CODES.INTERNAL_SERVER_ERROR,
            error: {
                message: "Unknown Error!",
                description: error.message
            }
        }
    }
}

module.exports = Response;
//module.exports = new Response();