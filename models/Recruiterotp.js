const mongoose = require("mongoose");
const validator = require('validator')
const recruiterotpSchema = new mongoose.Schema({
    cmp_email: {
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

const recruiterotp = mongoose.model("recruiterotp", recruiterotpSchema, 'recruiterotp')
module.exports = recruiterotp