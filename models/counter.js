const mongoose = require("mongoose");
const Tbl_js_signup = require("./signupSchema").default;

const counterSchema = {
    id: {
        type: String
    },
    seq: {
        type: Number
    }
}

module.exports = mongoose.model("Counter", counterSchema);