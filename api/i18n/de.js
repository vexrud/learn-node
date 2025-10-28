const Enum = require("../config/Enum");

module.exports = {
    "COMMON": {
        "VALIDATION_ERROR": "Validierungsfehler.",
        "ALREADY_EXISTS": "Existiert bereits.",
        "NEED_PERMISSION": "Brauche eine Erlaubnis.",
        "INTERNAL_SERVER_ERROR": "Unbekannter interner Serverfehler!",
        "UNKNOWN_ERROR": "Unerwarteter Fehler ist aufgetreten!",
        "INVALID_ID": "Ungültige ID.",
        "TOKEN_EXPIRED": "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
        "INVALID_TOKEN": "Ungültiges oder beschädigtes Token.",
        "DATABASE_UNAVAILABLE": "Datenbankverbindung fehlgeschlagen. Bitte versuchen Sie es später erneut.",
        "INVALID_JSON": "Fehlerhaftes JSON im Anfrageinhalt.",
        "FIELD_MUST_BE_FILLED": "'${}' Feld muss ausgefüllt werden.",
        "FIELD_MUST_BE_ARRAY": "'${}' Feld muss ein Array sein.",
        "FIELD_MUST_BE_EMAIL_FORMAT": "'${}' Feld muss ein E-Mail-Format sein.",
        "INVALID_PASSWORD": "'${}' länge muss größer sein als" + Enum.PASSWORD_LENGTH,
        "INVALID_PHONE_NUMBER": "'${}' feld muss eine Telefonnummer sein" + Enum.PHONE_NUMBER,
        "INVALID_FIELD_CHARACTERS": "Die Länge des Felds '${}' muss aus '${}'-Zeichen bestehen.",
        "WRONG_EMAIL_OR_PASSWORD": "Das E-Mail- oder Passwortfeld wurde falsch eingegeben."       
    }
}
