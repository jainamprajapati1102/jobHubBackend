const path = require('path');
const multer = require('multer');
//file uploading
// const pathj = path.join(__dirname, './public/Uploads/companylogo');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads1/resume');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
})

const resume = multer({ storage: storage }).single('resume');
module.exports = resume 