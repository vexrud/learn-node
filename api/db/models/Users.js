const mongoose = require("mongoose");
const { PASS_LENGTH, HTTP_CODES } = require("../../config/Enum");
const is_js = require("is_js");
const CustomError = require("../../lib/Error");
const bcrypt = require("bcrypt-nodejs");
//const tckimlik = require('tckimlik');
//const validateTCKN = tckimlik.validate || tckimlik.default || tckimlik;

const schema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    first_name: String,
    last_name: String,
    tc_no: {
        type: String,
        required: true,
        unique: true,
        // validate: {
        //     validator: (value) => validateTCKN(value),
        //     message: 'Geçersiz T.C. kimlik numarası',
        // }
    },
    yas: Number,
    adres: { type: String, required: true },
    phone_number: String
}, {
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

class Users extends mongoose.Model {
    validPassword(password){
        return bcrypt.compareSync(password, this.password);
    }

    static validateFieldsBeforeAuth(email, password){
        if (typeof password !== "string" || password.length < PASS_LENGTH || is_js.not.email(email))
        {
            throw new CustomError(HTTP_CODES.UNAUTHORIZED, "Validation Error!", "email or password wrong");
        }

        return null;
    }
}

schema.loadClass(Users);
module.exports = mongoose.model("users", schema);
