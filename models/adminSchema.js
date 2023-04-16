const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    adminemail: { type: String },
    adminpwd: { type: String },
})

const Tbl_admin = mongoose.model("Tbl_admin", adminSchema);
module.exports = Tbl_admin;