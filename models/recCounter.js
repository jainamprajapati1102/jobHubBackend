const mongoose = require("mongoose");
const Tbl_rec_signup = require("./recSignupSchema");

const counterSchema = {
    id: {
        type: String
    },
    seq: {
        type: Number
    }
}

module.exports = mongoose.model("RecCounter", counterSchema);