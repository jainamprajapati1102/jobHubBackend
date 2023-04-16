const express = require("express");
const Tbl_jobpost = require("../../models/jobPost");
const app = express();
const router = express.Router();
require('../../db/conn');
const jobPost = require('../../models/jobPost');
router.use(express.json());
const jobpost = async (req, res) => {
    try {
        const { jobtitle, gender, category, salaryrange, vacancy, experience, jobtype, qualification, skill, languageknown, interviewtype, joblocation, description } = req.body;

        if (jobtitle && gender && category && salaryrange && vacancy && experience && jobtype && qualification && skill && languageknown && interviewtype && joblocation && description) {

            const newJobPost = await addjobmodel.create({
                postedby: req.cmp,
                jobtitle: jobtitle,
                gender: gender,
                category: category,
                salaryrange: salaryrange,
                vacancy: vacancy,
                experience: experience,
                jobtype: jobtype,
                qualification: qualification,
                skill: skill,
                languageknown: languageknown,
                interviewtype: interviewtype,
                joblocation: joblocation,
                description: description
            });
            await newJobPost.save();
            res.send({ status: 200, msg: "Job Post Successfully" })
        } else {
            console.log("All Fileds Are Required!!")
            res.send("All Fileds Are Required!!")
        }
    } catch (error) {
        console.log(`Error in Job Post ${error}`)
        res.send(`something wrong`);
    }
}

module.exports = { jobpost }