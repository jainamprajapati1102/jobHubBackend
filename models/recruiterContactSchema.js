const mongoose = require("mongoose");

const recContactSchema = new mongoose.Schema({
    rec_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tbl_rec_signup' },
    cont_sub: { type: String },
    cont_msg: { type: String },

})
const tbl_rec_contact = mongoose.model('tbl_rec_contact', recContactSchema, "tbl_rec_contact");
module.exports = tbl_rec_contact;