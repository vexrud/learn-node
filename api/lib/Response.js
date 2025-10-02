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