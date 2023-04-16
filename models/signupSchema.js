const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
// const dotenv = require("dotenv");
// dotenv.config({ path: './confi.env' });
const jsRegisterSchema = new mongoose.Schema({
    js_id: { type: String, require: true, trim: true },
    js_name: { type: String, require: true, trim: true },
    js_email: { type: String, require: true, trim: true },
    js_pwd: { type: String, require: true, trim: true },
    js_mno: { type: Number, require: true, trim: true },
    js_gender: { type: String, require: true, trim: true },
    js_quli: { type: String, require: true, trim: true },
    js_skill: { type: String, require: true, trim: true, default: null },
    js_dob: { type: Date },
    js_hobby: { type: String, require: true, trim: true },
    uni_detail: { type: String, require: true, trim: true },
    js_course_type: { type: String, require: true, trim: true },
    js_other_skill: { type: String, require: true, trim: true },
    js_course_duration: { type: String, require: true, trim: true },
    js_profile: { type: String },
    js_language: { type: String, require: true, trim: true },
    js_expierience: { type: Number, require: true, trim: true },
    js_exp_company: { type: String, require: true, trim: true },
    googleId: String,
    isBlock: { type: Number, default: null }

})

// jsRegisterSchema.methods.generateToken = async function () {
//     try {
//         let token = jwt.sign({ _id: this._id }, process.env.SECRETE_KEY)
//         this.token = (token);
//         await this.save();
//         // console.log(token)
//         return token
//     } catch (er) {
//         console.log(er);
//     }
// }
const Tbl_js_signup = mongoose.model("Tbl_js_signup", jsRegisterSchema);
module.exports = Tbl_js_signup;