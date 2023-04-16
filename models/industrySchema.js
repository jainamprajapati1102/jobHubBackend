const mongoose = require("mongoose");

const industrySchema = new mongoose.Schema({
    ind_name: { type: String }
})

const Tbl_industry = mongoose.model("Tbl_industry", industrySchema);
module.exports = Tbl_industry;