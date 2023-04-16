const mongoose = require("mongoose");

const sekContactSchema = new mongoose.Schema({
    recruiter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tbl_rec_signup' },
    ratingstar: { type: Number },
    review: { type: String },

})
const Tbl_rec_review = mongoose.model('Tbl_rec_review', sekContactSchema, "Tbl_rec_review");
module.exports = Tbl_rec_review;