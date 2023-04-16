const mongoose = require("mongoose");

const rec_signupSchema = mongoose.Schema({
    cmp_name: { type: String, required: true, trim: true },
    cmp_pwd: { type: String, required: true },
    cmp_email: { type: String, required: true, trim: true },
    cmp_logo: {
        type: String,
    },
    esta_date: {
        type: Date
    },
    cmp_tagline: {
        type: String,

    },
    cmp_owner: {
        type: String,

    },
    industry_cat: {
        type: String,

    },
    rec_mno: {
        type: Number,

    },
    landline: {
        type: String,

    },
    websitelink: {
        type: String,

    },
    zipcode: {
        type: Number,

    },
    country: {
        type: String,

    },
    state: {
        type: String,

    },
    city: {
        type: String,

    },
    employess: {
        type: String, default: null

    },
    worktime: {
        type: String,

    },
    cmp_address: {
        type: String,

    },
    google: {
        type: String,

    },
    twitter: {
        type: String,

    },
    linkdin: {
        type: String,

    },
    js_salary: {
        type: String
    },
    ispaid: {
        type: String,
        default: null
    },
    isBlock: { type: Number, default: null }

},
    { timestamps: true }
)

const Tbl_rec_signup = mongoose.model("Tbl_rec_signup", rec_signupSchema);
module.exports = Tbl_rec_signup;