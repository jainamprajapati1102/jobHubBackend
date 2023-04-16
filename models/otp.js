const mongoose = require("mongoose");
const validator = require('validator')
const adminOtpSchema = new mongoose.Schema({
    adminemail: {
        type: String,
        requires: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Not Valid Email")
            }
        }
    },
    otp: {
        type: String,
        required: true
    }
})

const adminotp = mongoose.model("otp", adminOtpSchema, 'adminotp')
module.exports = adminotp