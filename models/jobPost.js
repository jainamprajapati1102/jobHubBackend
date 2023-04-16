const mongoose = require("mongoose");

const jobPostSchema = new mongoose.Schema({
    jobtitle: {
        type: String, required: true
    },
    gender: {
        type: String, required: true
    },
    degree: {
        type: String, required: true
    },
    salaryrange: {
        type: String, required: true
    },
    vacancy: {
        type: Number, required: true
    },
    experience: {
        type: String, required: true
    },
    jobtype: {
        type: String, required: true
    },
    qualification: {
        type: String, required: true
    },
    skill: {
        type: String, required: true
    },
    languageknown: {
        type: String, required: true
    },
    interviewtype: {
        type: String, required: true
    },
    description: {
        type: String, required: true
    },

    designation: {
        type: String
    },
    postedate: {
        type: Date
    },
    postedby: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Tbl_rec_signup'
    },
    isDeleted: { type: String, default: null }
}, { timestamps: true })


const Tbl_jobpost = mongoose.model('Tbl_jobpost', jobPostSchema)
module.exports = Tbl_jobpost;