const mongoose = require("mongoose");
const Tbl_rec_signup = require("./recSignupSchema")
const Tbl_js_signup = require("./signupSchema");

const jobapplySchema = mongoose.Schema({
    rec_id: {
        type: mongoose.Schema.Types.ObjectId, ref: "Tbl_rec_signup"
    },
    js_id: {
        type: mongoose.Schema.Types.ObjectId, ref: "Tbl_js_signup"
    },
    resume: {
        type: String
    },
    show: {
        type: String,
        Default: null
    },
    accept: 0
    ,
}, { timestamps: true }
)

const Tbl_jobapply = mongoose.model("Tbl_jobapply", jobapplySchema)
module.exports = Tbl_jobapply;