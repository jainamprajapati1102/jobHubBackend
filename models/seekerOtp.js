const mongoose = require("mongoose");
const validator = require('validator')
const seekerotpSchema = new mongoose.Schema({
    js_email: {
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

const seekerotp = mongoose.model("seekerotp", seekerotpSchema, 'seekerotp')
module.exports = seekerotp