const mongoose = require("mongoose");
mongoose.set('strictQuery', true)
const DB = mongoose.connect("mongodb://127.0.0.1:27017/job");
if (DB) {
    console.log("connection Successful!!");
} else {
    console.log("Connection Is Not Successful !");
}