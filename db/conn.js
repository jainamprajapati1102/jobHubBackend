const mongoose = require("mongoose");
mongoose.set('strictQuery', true)
const DB = mongoose.connect("mongodb+srv://admin:admin@jobshub.hzo5qig.mongodb.net/?retryWrites=true&w=majority");
if (DB) {
    console.log("connection Successful!!");
} else {
    console.log("Connection Is Not Successful !");
}