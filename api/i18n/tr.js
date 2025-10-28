const Enum = require("../config/Enum");

module.exports = {
    "COMMON": {
        "VALIDATION_ERROR": "Doğrulama hatası.",
        "ALREADY_EXISTS": "Sistemde zaten mevcut.",
        "NEED_PERMISSION": "Izin gerekiyor.",
        "INTERNAL_SERVER_ERROR": "Bilinmeyen iç sunucu hatası!",
        "UNKNOWN_ERROR": "Beklenmeyen bir sorun oluştu!",
        "INVALID_ID": "Geçersiz id hatası.",
        "TOKEN_EXPIRED": "Token süresi doldu. Lütfen yeniden giriş yapın.",
        "INVALID_TOKEN": "Geçersiz token.",
        "DATABASE_UNAVAILABLE": "Veritabanı bağlantısı başarız. Lütfen daha sonra tekrar deneyin.",
        "INVALID_JSON": "Geçersiz JSON formatı.",
        "FIELD_MUST_BE_FILLED": "'${}' alanı doldurulmalıdır.",
        "FIELD_MUST_BE_ARRAY": "'${}' alanı bir array olmalıdır.",
        "FIELD_MUST_BE_EMAIL_FORMAT": "'${}' alanı email formatında olmalıdır.",
        "INVALID_PASSWORD": "'${}' alanı" + Enum.PASSWORD_LENGTH + "bu değerden daha fazla karakter içermelidir.",
        "INVALID_PHONE_NUMBER": "'${}' alanı bir telefon numarası olmalıdır. Örn:" + Enum.PHONE_NUMBER,
        "INVALID_FIELD_CHARACTERS": "'${}' alanı geçersiz karakter uzunluğuna sahip, bu alanın olması gereken karakter uzunluğu '${}' 'dur.",
        "WRONG_EMAIL_OR_PASSWORD": "Email veya şifre alanı yanlış girildi."
    }
}