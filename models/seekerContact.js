const mongoose = require("mongoose");

const sekContactSchema = new mongoose.Schema({
    seeker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tbl_js_signup' },
    cont_sub: { type: String },
    cont_msg: { type: String },

})
const Tbl_js_contact = mongoose.model('Tbl_js_contact', sekContactSchema);
module.exports = Tbl_js_contact;