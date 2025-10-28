const Enum = require("../config/Enum");

module.exports = {
    "COMMON": {
        "VALIDATION_ERROR": "Validation error.",
        "ALREADY_EXISTS": "Already exists.",
        "NEED_PERMISSION": "Need permission.",
        "INTERNAL_SERVER_ERROR": "Unknown Internal Server Error!",
        "UNKNOWN_ERROR": "Unexpected error occured!",
        "INVALID_ID": "Invalid id error.",
        "TOKEN_EXPIRED": "Your session has expired. Please login again.",
        "INVALID_TOKEN": "Invalid or malformed token.",
        "DATABASE_UNAVAILABLE": "Database connection failed. Please try again later.",
        "INVALID_JSON": "Malformed JSON in request body.",
        "FIELD_MUST_BE_FILLED": "'${}' field must be filled.",
        "FIELD_MUST_BE_ARRAY": "'${}' field must be an array.",
        "FIELD_MUST_BE_EMAIL_FORMAT": "'${}' field must be an email format.",
        "INVALID_PASSWORD": "'${}' length must be greater than" + Enum.PASSWORD_LENGTH,
        "INVALID_PHONE_NUMBER": "'${}' field must be a phone number" + Enum.PHONE_NUMBER,
        "INVALID_FIELD_CHARACTERS": "The length of the '${}' field must be '${}' characters.",
        "WRONG_EMAIL_OR_PASSWORD": "The email or password field was entered incorrectly."
    }
}