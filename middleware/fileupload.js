const path = require('path');
const multer = require('multer');
//file uploading
// const pathj = path.join(__dirname, './public/Uploads/companylogo');


// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'public/uploads1/companylogo');
//     },
//     filename: function (req, file, cb) {
//         const filename = Date.now() + file.originalname
//         cb(null, filename);
//     }

// })

// // filter
// const filefilter = (req, file, cb) => {

//     if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
//         cb(null, true)
//     } else {
//         cb(null, false)
//         return cb(new Error("Only .png , .jpg , .jpeg Formate Allowed"))
//     }
// }



var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads1/companylogo');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
})



const upload = multer({ storage: storage }).single('cmp_logo');
module.exports = upload 