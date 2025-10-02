/** Endpoint (API)'lerde middleware tarafında karşılaşılan belirli koşullarda response olarak error göndermek istediğimiz durumlarda
 * standart bir error response yapısı oluşturması amacıyla CustomError class'ı oluşturulmuştur.
 */
class CustomError extends Error {
    constructor(code, message, description) {
        super(`{"code": "${code}", "message": "${message}", "desciption": "${description}"}`);
        this.code = code;
        this.message = message;
        this.description = description;
    }
}

module.exports = CustomError;