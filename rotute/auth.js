const express = require("express");
const mongoose = require("mongoose");
const app = express();
const fs = require("fs")
var session = require('express-session')
const router = express.Router();
require('../db/conn');  // db connection 
const Tbl_js_signup = require("../models/signupSchema"); // schema for the user rigister
const Tbl_rec_signup = require("../models/recSignupSchema"); // schema for the Recruiter rigister
const Tbl_js_contact = require('../models/seekerContact');// schema for the seekerContact us 
const Tbl_jobpost = require("../models/jobPost");
const Tbl_js_review = require("../models/seekerReviewSchema")
const Tbl_rec_review = require("../models/recruiterReviewSchema")
const tbl_rec_contact = require("../models/recruiterContactSchema")
router.use(express.json());
const bcrypt = require("bcrypt");  // for pass hashing 
const jwt = require('jsonwebtoken');
const Counter = require("../models/counter");
const dotenv = require("dotenv");
dotenv.config({ path: './config.env' });  // config file
const cookie = require("cookie-parser");//Cookie
// const Tbl_jobpost = require("../models/jobPost");
const Tbl_jobapply = require("../models/jobapplaySchema");
app.use(cookie);
const nodemailer = require("nodemailer");
const Tbl_industry = require("../models/industrySchema")
const csv = require("fast-csv")
const Razorpay = require("razorpay")
const crypto = require("crypto")
const tbl_payment = require("../models/PaymentSchema")
const passport = require("passport")
const Tbl_admin = require("../models/adminSchema")
const Otp = require("../models/otp")
const axios = require("axios");
const pdfTemplate = require('../documentjs/document');
const PaymentReceiptTemplate = require('../documentjs/bill')
const seekerotp = require('../models/seekerOtp')
const recruiterotp = require('../models/Recruiterotp')

var homeviewindustry = async (req, res) => {
    try {
        const data = await Tbl_industry.find().limit(8);
        res.status(200).send(data)
    } catch (error) {
        console.log(`Error from the view industry :--->${error}`)
    }
}

var seekerbackup = async (req, res) => {
    // const jsid = req.user.id
    try {
        const record = await Tbl_js_signup.aggregate([
            {
                // for()
                $lookup: {
                    from: "tbl_jobapplies",
                    localField: "_id",
                    foreignField: "js_id",
                    as: "seeker_apply_data"
                }
            },
            {
                $lookup: {
                    from: "Tbl_js_review",
                    localField: "_id",
                    foreignField: "seeker_id",
                    as: "seeker_review_data"
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ])

        res.send({ record })
    } catch (error) {
        console.log(`Error from the seeker back up ====>${error}`)
    }

}

// Special Case Try 

var seekercontact = async (req, res) => {
    try {
        const { cont_sub, cont_msg } = req.body;
        const data = await Tbl_js_contact.create({
            seeker_id: req.user.id,
            cont_sub: req.body.cont_sub,
            cont_msg: req.body.cont_msg,
        })
        res.status(201).send({ status: 201, msg: "send it contact" })
    } catch (error) {
        console.log(`Error from the seeker contact ${error}`)
    }
}

var signup = async (req, res) => {
    try {
        const { js_name, js_email, js_mno, js_cpwd, js_pwd } = req.body;
        const seekerData = new Tbl_js_signup({ js_name, js_email, js_mno, js_cpwd, js_pwd });
        const emailMatch = await Tbl_js_signup.findOne({ js_email: js_email });
        if (js_name && js_email && js_mno && js_cpwd && js_pwd) {
            if (emailMatch) {
                console.log("Email Already Exist!! Please Login");
                return res.json({ status: 3, err: "Email Already Exist!! Please Login " });
            } else {
                if (js_pwd == js_cpwd) {
                    const salt = await bcrypt.genSalt(12);
                    const secPass = await bcrypt.hash(req.body.js_pwd, salt);
                    const secCPass = await bcrypt.hash(req.body.js_cpwd, salt);
                    const data = await Tbl_js_signup.create({
                        js_id: abc,
                        js_name: req.body.js_name,
                        js_email: req.body.js_email,
                        js_mno: req.body.js_mno,
                        js_pwd: secPass,
                        js_cpwd: secCPass
                        // tokens: token
                    })
                    if (data) {
                        const mailOptions = {
                            from: process.env.EMAIL,
                            to: js_email,
                            subject: "Thank You For Signup in Job's Hub",
                            html: `<p>Here is your <strong>username</strong> and <strong>password</strong>:</p>
                                                                <p><strong>Username:</strong>   ${js_email}
                                                                <p><strong>Password:</strong> ${js_pwd}</p>`
                        }
                        console.log("mailoption")
                        transporter.sendMail(mailOptions, async (error, info) => {
                            if (error) {
                                console.log("Error", error)
                                await res.status(401).json({ err: "error", status: 401 })
                                console.log("transportor error")
                            } else {
                                console.log(`Email sent :- ${info}`)
                                await res.status(201).json({ info, status: 201 })
                            }
                        })
                    }
                    console.log(data);
                    if (data) {
                        res.status(200).send({ status: 200, data: data, msg: " Inserted successfully..." });
                    }
                } else {
                    return res.json({ status: 400, err: "Pass & cpass must be same" })
                }
            }
        } else {
            return res.json({ status: 400, err: "All fields required" })
        }
    } catch (err) {
        console.log(`ky locho in Sign up :- ${err}`)
        return res.json({ status: 400, err: "Something is wrong" })
    }
}
var signin = async (req, res) => {
    try {
        let token;
        const { js_email, js_pwd } = req.body;
        console.log(req.body)
        if (js_email && js_pwd) {
            const user = await Tbl_js_signup.findOne({ js_email: js_email });
            if (user) {
                if (user.isBlock == 1) {
                    res.send({ status: 11, err: "You are Blocked From Job's Hub" })
                } else {
                    if (user) {
                        const passMatch = await bcrypt.compare(js_pwd, user.js_pwd);
                        console.log(passMatch)
                        if (js_email === user.js_email && passMatch) {
                            const token = jwt.sign({ id: user._id }, process.env.SECRETE_KEY)
                            if (user.js_skill == null) {

                                console.log("Logedin")
                                res.json({ status: 1, msg: "Logedin", tok: token, id: user._id });
                            } else {
                                console.log("Logedin")
                                res.json({ status: 2, msg: "Logedin", tok: token, id: user._id });
                            }
                        } else {
                            console.log("Invalid Credential")
                            return res.json({ status: 400, err: "Invalid Credential" })
                        }
                    } else {
                        console.log("User not register")
                        return res.json({ status: 400, err: "User not register" })
                    }
                }
            } else {
                console.log("User Not Exist ")
                res.status(400).send({ status: 8, err: "Please Create Your Account First " })
            }

        } else {
            console.log("All fields required")
            return res.json({ status: 400, err: "All fields required" })
        }
    } catch (err) {
        console.log(err);
        return res.json({ status: 400, err: "login failed Plz try again" })
    }
}

const sekdeleteaccount = async (req, res) => {
    try {
        const id = req.user.id
        const match = await Tbl_js_signup.findById({ _id: id });
        if (match) {

            const recdel = await Tbl_js_signup.findByIdAndDelete({ _id: id });
            const appdel = await Tbl_jobapply.findOneAndDelete({ js_id: id })
            const revdel = await Tbl_js_review.findOneAndDelete({ seeker_id: id })
            const condel = await Tbl_js_contact.findOneAndDelete({ seeker_id: id })
            const otpdel = await seekerotp.findOneAndDelete({ js_email: match.js_email })
            res.status(201).send({ msg: "Recruiter Account Deleted", status: 201 })

        } else {
            res.status(400).send("User Not Exist ")
        }
    } catch (error) {
        console.log(`Error from the Seeker delete Account==>${error}`)
    }
}

var getseeker = async (req, res) => {
    // console.log()
    res.send(req.user)
}

var updateprofile = async (req, res) => {
    try {
        const id = req.user.id
        const usermatch = await Tbl_js_signup.findById({ _id: id })
        if (usermatch) {
            const updateUser = await Tbl_js_signup.findByIdAndUpdate({ _id: id }, {
                $set: req.body
            }, { new: true })
            const jp = await updateUser.save();
            res.status(201).send({ status: 201, jp })
        } else {
            res.status(401).send({ status: 401, error: "User Invalid " })

        }
    } catch (error) {
        console.log(`Error from the Update Profil--->e${error} `)
    }

}

// Profile Picture Update
var updateimage = async (req, res) => {
    try {
        console.log(req.user.id)
        let body = req.body
        body = req?.file?.filename
        console.log(`jainam image ===>${body}`)
        console.log(body)
        const match = await Tbl_js_signup.findById({ _id: req.user.id })
        if (match) {
            const updatepic = await Tbl_js_signup.findByIdAndUpdate(
                { _id: req.user.id },
                { $set: { js_profile: body } },
                { new: true }
            )
            updatepic.save();
            res.status(201).json({ msg: "Profile pic uploaded", status: 201 })
        } else {
            res.status(401).json({ error: "Profile pic Not uploaded", status: 401 })
            let url = req.file.filename;
            const imageUrl = `./public/uploads1/seekerprofile/${url}`;
            console.log("image url===>", imageUrl);
            fs.unlinkSync(imageUrl);
        }
    } catch (error) {
        console.log(`Error from the Image upload ===> ${error}`)
        res.status(400).json({ error: "There is some error" });
        console.log(error);
        let url = req.files.filename;
        const imageUrl = `./public/uploads1/seekerprofile/${url}`;
        console.log("image url===>", imageUrl);
        await fs.unlinkSync(imageUrl);
    }
}

var js_contact = async (req, res) => {
    try {
        const { js_sub, js_msg } = req.body;
        const seeker_contact = await Tbl_js_contact.create({
            seeker_id: req.body.seeker_id,
            cont_sub: req.body.js_sub,
            cont_msg: req.body.js_msg
        })
        console.log(seeker_contact);
        res.send({ status: 200, msg: "Successful contact" })
    } catch (error) {
        console.log(error);
    }
}

const seekerreview = async (req, res) => {
    try {
        const id = req.user.id
        const exist = await Tbl_js_review.findOne({ seeker_id: id })
        if (exist) {
            const data = await Tbl_js_review.findOneAndUpdate({ seeker_id: id },
                {
                    $set: {
                        ratingstar: req.body.ratingstar,
                        review: req.body.review
                    }
                },
                { new: true })
            res.status(201).send({ status: 201, data: data, msg: "review send" })
        } else {
            const data = await Tbl_js_review.create({
                seeker_id: id,
                ratingstar: req.body.ratingstar,
                review: req.body.review
            })
            res.status(201).send({ status: 201, data: data, msg: "review send" })
        }

    } catch (error) {
        console.log(`Error from the send msg :===>${error}`)
    }
}

var getseekerreview = async (req, res) => {
    try {
        const id = req.user.id;
        const data = await Tbl_js_review.findOne({ seeker_id: id }).populate('seeker_id')
        res.status(201).send(data)
    } catch (error) {

    }
}

var sendmsg = (req, res) => {
    const { message, numers } = req.body
    const option = {
        authorization: "GKtqkaIObmUrSxLu0ReQNf3gcFjdAYnoi2965TVZJCPzyHBlW1s4cflBz6hnyH1vjgLU9km3IXFGaW2p",
        message: message,
        numbers: [numers]
    }
    fast2fast.sendMessage(option)
        .then((response) => {
            console.log(req.body);
            console.log(response)
        })
        .catch((error) => {
            console.log(`Error from the sending sms====>${error}`)
        })
}

var get_contact = async (req, res) => {
    const conData = await Tbl_js_contact.findOne({ _id: req.body.seeker_id }).populate('seeker_id');
    res.send({ msg: conData });
}


const getjobpost = async (req, res) => {
    const search = req.query.search || ""
    const gender = req.query.gender || ""
    const salaryrange = req.query.salaryrange || ""
    const jobtype = req.query.jobtype || ""
    const isDeleted = true;
    const qualification = req.query.qualification || ""
    const sort = req.query.sort || ""
    console.log("salaRY RANGE ", salaryrange)
    console.log("job type", jobtype)
    console.log("timming", sort)
    const query = {
        isDeleted: true,
        jobtitle: {
            $regex: search
        }
    }
    if (gender) {
        query.gender = gender
    }

    if (salaryrange) {
        query.salaryrange = salaryrange
    }

    if (jobtype) {
        query.jobtype = jobtype
    }

    if (qualification) {
        query.qualification = qualification
    }

    console.log(` querty stirng ===>${JSON.stringify(query)}`)
    try {
        console.log(query)
        const job = await Tbl_jobpost.find(
            query
        ).populate('postedby');
        res.status(200).send(job)
    } catch (error) {
        console.log(`Error in Gegt Job Post :- ${error}`);
    }
}

const getjobedu = async (req, res) => {
    try {
        const jo = req.user.js_quli
        console.log("degree", jo)
        const job = await Tbl_jobpost.find({ "degree": { $in: [jo] } }).populate('postedby');
        // const job = await Tbl_jobpost.find({},{ $in: { "qualification": jo } }).populate('postedby');
        console.log(`Posted job ----->${job}`);
        res.status(200).send(job)
    } catch (error) {
        console.log(`Error in Gegt Job Post :- ${error}`);
    }
}

var applyjob = async (req, res) => {
    try {
        const rec_id = req.params.id
        const js_id = req.user.id
        console.log(js_id)
        const resume = req.file.filename
        console.log('out of condition ')
        const aplydata = new Tbl_jobapply({ js_id, rec_id, resume })
        if (js_id && rec_id && resume) {
            console.log('into condition ')
            const data = await Tbl_jobapply.create({
                js_id: js_id,
                rec_id: rec_id,
                resume: resume,
                accept: 0
            })
            res.status(201).send({ data, status: 201 })
        }
    } catch (error) {
        console.log(`error ${error}`);
    }
}


var mail = async (req, res) => {
    const { js_email } = req.body;
    try {
        console.log("hiii")
        const emailMatch = await Tbl_js_signup.findOne({ js_email: js_email });
        console.log(emailMatch)
        if (emailMatch) {
            const OTP = Math.floor(100000 + Math.random() * 900000)
            const otpemail = await seekerotp.findOne({ js_email: js_email })
            if (otpemail) {
                const updateotp = await seekerotp.findOneAndUpdate({ js_email }, { $set: { otp: OTP } }, { new: true })
                await updateotp.save();
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: js_email,
                    subject: "OTP For Forgot Password",
                    text: `Your OTP is  :- ${OTP}`
                }
                transporter.sendMail(mailOptions, async (error, info) => {
                    if (error) {
                        console.log("Error", error)
                        res.status(401).json({ err: "Email Id Not Exist In Job's Hub", status: 401 })

                    } else {
                        console.log(`Email sent :- ${JSON.stringify(info)}`)
                        await res.status(201).json({ status: 201 })
                    }
                })
            } else {
                const saveOpt = await seekerotp.create({
                    js_email: req.body.js_email, otp: OTP
                })
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: js_email,
                    subject: "OTP For Forgot Password",
                    text: `Your OTP is  :- ${OTP}`
                }
                transporter.sendMail(mailOptions, async (error, info) => {
                    if (error) {
                        console.log("Error", error)
                        res.status(401).json({ err: "Email Id Not Exist In Job's Hub", status: 401 })
                    } else {
                        console.log(`Email sent :- ${JSON.stringify(info)}`)
                        await res.status(201).json({ status: 201 })
                    }
                })
            }
        } else {
            console.log("user not found")
            res.status(401).json({ err: "Email Id Not Exist In Job's Hub", status: 401 })
        }
    } catch (error) {
        console.log(`Error in mail auth :- ${error}`)
    }

}


var seekerotpverify = async (req, res) => {
    try {
        console.log(req.body)
        const { otp, js_email } = req.body
        const match = await seekerotp.findOne({
            js_email: req.body.js_email
        })
        if (match) {
            if (req.body.otp === match.otp) {
                res.status(201).send({ status: 201, msg: "OTP is Verify" })
            } else {
                res.status(400).send({ msg: "Invalid OTP ", status: 400 })
            }
        }
    } catch (error) {
        console.log("into catch")
        res.status(400).send({ status: 400, error })
    }
}

var seekerforgot = async (req, res) => {
    const { js_email, newpwd, conpwd } = req.body
    try {
        const valid = await seekerotp.findOne({ js_email: js_email });
        console.log(`valid form the seekerforgot  ${valid}`)
        if (valid) {
            const match = await Tbl_js_signup.findOne({ js_email: js_email })
            const salt = await bcrypt.genSalt(12)
            const secPass = await bcrypt.hashSync(newpwd, salt)

            const updatepass = await Tbl_js_signup.findOneAndUpdate(
                { js_email: js_email },
                { $set: { js_pwd: secPass } },
                { new: true }
            );
            await updatepass.save();
            res.status(201).send({ msg: "Password Changed", status: 201 })
        } else {
            res.status(401).send({ msg: "Please Try Again", status: 401 })
        }
    } catch (error) {
        console.log("catch from the seekerforgot", error)
        res.status(401).send({ status: 401, error })
    }
}

//  Get Seeker Applied Job Data 

var jobhistory = async (req, res) => {
    console.log(`out of try ===>${req.user.id}`)
    try {
        const id = req.user.id

        const data = await Tbl_jobapply.find({ js_id: id, show: true }, { show: 0 }).populate('rec_id')

        res.status(201).send(data)
        console.log(data);
    } catch (error) {
        console.log(`Error from the jobhistory catch :- ${error}`)
    }
}
var jobhistoryaccept = async (req, res) => {
    console.log(`out of try ===>${req.user.id}`)
    try {
        const id = req.user.id

        const data = await Tbl_jobapply.find({ js_id: id, show: true, accept: 1 }, { show: 0 }).populate('rec_id')

        res.status(201).send(data)
        console.log(data);
    } catch (error) {
        console.log(`Error from the jobhistory catch :- ${error}`)
    }
}
var jobhistoryreject = async (req, res) => {
    console.log(`out of try ===>${req.user.id}`)
    try {
        const id = req.user.id

        const data = await Tbl_jobapply.find({ js_id: id, show: true, accept: 2 }, { show: 0 }).populate('rec_id')

        res.status(201).send(data)
        console.log(data);
    } catch (error) {
        console.log(`Error from the jobhistory catch :- ${error}`)
    }
}
//  Seeker Job Apply Backup 

var jobbackup = async (req, res) => {
    try {
        const { id } = req.params
        console.log("aavi gayu 6 ", id)
        console.log(req.user.id)
        const match = await Tbl_jobapply.findById({ _id: id }).populate('js_id')
        console.log(match)
        if (match) {
            const newapply = await Tbl_jobapply.findByIdAndUpdate({ _id: id }, { $set: { show: false } }, { new: true })
            newapply.save();
            res.status(201).send({ status: 201, newapply })
            console.log(newapply)
        } else {
            res.status(401).send({ status: 401, err: "Not Backup" })
            console.log("not")
        }
    } catch (error) {
        console.log(`Error from the job backup :- ${error}`)
    }

}

var jobapplyrestore = async (req, res) => {
    try {
        const { id } = req.params
        console.log("aavi gayu 6 ", id)
        console.log(req.user.id)
        const match = await Tbl_jobapply.findById({ _id: id }).populate('js_id')
        console.log(match)
        if (match) {
            const newapply = await Tbl_jobapply.findByIdAndUpdate({ _id: id }, { show: true }, { new: true })
            newapply.save();
            res.status(201).send({ status: 201, newapply })
            console.log(newapply)
        } else {
            res.status(401).send({ status: 401, err: "Not Backup" })
            console.log("not")
        }
    } catch (error) {
        console.log(`Error from the job backup :- ${error}`)
    }

}

// Seeker job restore
var restorejob = async (req, res) => {
    try {
        const id = req.user.id
        const data = await Tbl_jobapply.find({ js_id: id, show: { $ne: null } }, { show: 0 }).populate('rec_id').populate('js_id')
        res.status(201).send(data)
    } catch (error) {
        console.log(`Error from the jobhistory catch :- ${error}`)
    }
}

// Apply Job Delete
var seekerapplydel = async (req, res) => {
    try {
        const { id } = req.params
        console.log("aavi gayu 6 ", id)
        console.log(req.user.id)
        const match = await Tbl_jobapply.findById({ _id: id }).populate('js_id')
        console.log(match)
        if (match) {
            const newapply = await Tbl_jobapply.findByIdAndDelete({ _id: id })
            res.status(201).send({ status: 201, msg: "Application Deleted Successfull" })
            console.log(newapply)
        } else {
            res.status(401).send({ status: 401, err: "Not Backup" })
            console.log("not")
        }
    } catch (error) {
        console.log(`Error from the job delete :- ${error}`)
    }
}

// Change Password
var Changepassword = async (req, res) => {
    try {
        const { oldpwd, updatedpass, updateconpass } = req.body
        console.log(req.body)
        console.log(req.user.id);
        const match = await Tbl_js_signup.findById({ _id: req.user.id })
        if (match) {
            console.log(req.body.oldpwd)
            const passverify = await bcrypt.compare(oldpwd, match.js_pwd)
            if (passverify) {
                console.log("pass matched")
                const oldnewmatch = await bcrypt.compare(updatedpass, match.js_pwd);
                if (oldnewmatch) {
                    res.status(401).send({ status: 401, err: "New Password & Old Password  Always Diferent" })
                }
                if (updatedpass && updateconpass) {
                    if (updatedpass === updateconpass) {
                        const salt = await bcrypt.genSalt(12)
                        const securePass = await bcrypt.hash(updatedpass, salt)
                        const newPass = await Tbl_js_signup.findByIdAndUpdate({ _id: req.user.id }, { $set: { "js_pwd": securePass } })
                        newPass.save()
                        res.status(201).send({ status: 201, newPass, msg: "Password Chanege Successfully" })
                        console.log("success")
                    } else {
                        res.status(401).send({ status: 401, err: "New Password & Confirm Password Always same" })
                    }
                } else {
                    res.status(401).send({ status: 401, err: "All Field require" })
                }
            } else {
                console.log("pass not matched")
                res.status(401).send({ status: 401, err: "Old Password Not matched" })
            }
        }
    } catch (error) {
        console.log(`Error from the Change Password ---> ${error} `)
    }
}

// mail send 
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
});

var jobdetail = async (req, res) => {

}


//  %%%%%%%%%%%%%%%%%%%%%%%%%%  Recruiter APIs  %%%%%%%%%%%%%%%%%%%%%%%%%%

const reccontact = async (req, res) => {
    try {
        const data = await tbl_rec_contact.create({
            rec_id: req.user._id,
            cont_sub: req.body.cont_sub,
            cont_msg: req.body.cont_msg
        })

        res.status(201).send({ status: 201, msg: "Recruiter Contact Us Complete" })
    } catch (error) {

    }
}

var cmpupdatelogo = async (req, res) => {
    try {
        console.log(req.user._id)
        let body = req.body
        body = req?.file?.filename
        console.log(`jainam image ===>${body}`)
        console.log(body)
        const match = await Tbl_rec_signup.findById({ _id: req.user._id })
        if (match) {
            const updatepic = await Tbl_rec_signup.findByIdAndUpdate(
                { _id: req.user._id },
                { $set: { cmp_logo: body } },
                { new: true }
            )
            updatepic.save();
            res.status(201).json({ msg: "Profile pic uploaded", status: 201 })
        } else {
            res.status(401).json({ error: "Profile pic Not uploaded", status: 401 })
            let url = req.file.filename;
            const imageUrl = `./public/uploads1/companylogo/${url}`;
            console.log("image url===>", imageUrl);
            fs.unlinkSync(imageUrl);
        }
    } catch (error) {
        console.log(`Error from the Image upload ===> ${error}`)
        res.status(400).json({ error: "There is some error" });
        console.log(error);
        let url = req.files.filename;
        const imageUrl = `./public/uploads1/companylogo/${url}`;
        console.log("image url===>", imageUrl);
        await fs.unlinkSync(imageUrl);

    }
}

const cmpRegistration = async (req, res) => {
    try {
        const { cmp_name, cmp_pwd, rec_mno, cmp_email } = req.body
        const cmp_logo = req.file.filename
        console.log("logo", cmp_logo)
        const userExist = await Tbl_rec_signup.findOne({ cmp_email })
        if (userExist) {
            res.status(400).send({ msg: "User Already Exist", status: 400 })
        } else {
            if (cmp_name && cmp_pwd && rec_mno && cmp_logo && cmp_email) {
                const salt = await bcrypt.genSalt(12);
                const secPass = await bcrypt.hash(cmp_pwd, salt)
                const newUser = await Tbl_rec_signup.create({
                    cmp_name: req.body.cmp_name,
                    cmp_email: req.body.cmp_email,
                    rec_mno: req.body.rec_mno,
                    cmp_logo: cmp_logo,
                    cmp_pwd: secPass,
                })
                if (newUser) {
                    const transporter = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            user: process.env.EMAIL,
                            pass: process.env.PASS
                        }
                    });

                    const mailOptions = {
                        from: process.env.EMAIL,
                        to: cmp_email,
                        subject: "Thank You For Signup in Job's Hub",
                        html: `<p>Thank for registration , welcome to Job's Hub. </p><br>
                           Use Following credentails when prompted to log in:<br>
                            <p><strong>Username:</strong>   ${cmp_email}<br>
                           <p><strong>Password:</strong> ${cmp_pwd}</p> <br>
                            Do not Share with Anyone, <br>if you have any Question about your account or any other matter , please contact on email: jobshub0514@gmail.com <br><br>
                            Thank you again,<br>
                            <b>Job's Hub</b>
                  `
                    }
                    transporter.sendMail(mailOptions, async (error, info) => {
                        if (error) {
                            console.log("Error", error)
                            await res.status(401).json({ err: "error", status: 401 })
                            console.log("transportor error")
                        } else {
                            console.log(`Email sent :- ${JSON.stringify(info)}`)
                            const data = {
                                message: JSON.stringify(`Thank You For Registration in Job's Hub.\n Here Is your Username And Password :
                            Username:   ${cmp_email}
                            Password: ${cmp_pwd}  \n PLEASE DO NOT SHARE WITH ANYONE 
                            Link: ${`https://jobshub-8uup9udxz-jainam1102.vercel.app`}
                            `),
                                media: "[]",
                                delay: "0",
                                schedule: "",
                                numbers: `${rec_mno}`
                            };
                            try {
                                const response1 = axios.post('http://api.wapmonkey.com/send-message', data, {
                                    headers: {
                                        Authorization: "U2FsdGVkX18WTbtYybrUkRgo7/Xs82Hho79OfVRaj6ft4oYJYUEKkMi04eH0YNOW"
                                    }
                                });

                            } catch (error) {
                                console.error(error);
                                throw new Error('Failed to send message');
                            }
                        }
                    })
                    res.status(200).send({ status: 200, newUser, msg: " Inserted successfully..." });
                }
            }
        }
    } catch (error) {
        console.log("Error fro the recruiter sign ujp ", error)
    }
}

const cmpLogin = async (req, res) => {
    try {
        const { cmp_email, cmp_pwd } = req.body;
        console.log(req.body);
        let users = await Tbl_rec_signup.findOne({ cmp_email: cmp_email });
        console.log("users===>", users);
        if (users) {
            if (users.isBlock == 1) {
                console.log("You are Blocked From Job's Hub")
                res.send({ status: 11, err: "You are Blocked From Job's Hub" })
            } else {

                const passwordMatch = await bcrypt.compare(cmp_pwd, users.cmp_pwd);
                if (cmp_email === users.cmp_email && passwordMatch) {
                    const token = jwt.sign({ cmpid: users._id }, process.env.SECRETE_KEY);

                    const match = await tbl_payment.findOne({ paymentby: users._id })
                    console.log(match)
                    if (users.employess === null) {
                        res.send({ status: 200, exist: 1, "message": "Login Success...!", "token": token });
                    } else if (match?.ispaid === null || match === null) {
                        res.send({ status: 200, exist: 3, "message": "Login Success...!", "token": token });
                    }
                    else {
                        res.send({ status: 200, exist: 2, "message": "Login Success...!", "token": token });
                    }
                }
                else {
                    res.send({ status: 400, error: 'email or password are invalid' });
                    console.log("email or password are invalid ")
                }
            }

        }
        else {
            res.status(400).send({ status: 8, err: "Please Create Your Account First" })
        }

    }
    catch (error) {
        console.log(error);
    }
}


const recdeleteaccount = async (req, res) => {
    try {
        const match = await Tbl_rec_signup.findById({ _id: req.user._id });
        console.log("matched ", match)
        if (match) {
            const recdel = await Tbl_rec_signup.findByIdAndDelete({ _id: req.user._id });
            const recpost = await Tbl_jobpost.findOneAndDelete({ postedby: req.user._id })
            const reccon = await tbl_rec_contact.findOneAndDelete({ rec_id: req.user._id })
            const review = await Tbl_rec_review.findOneAndDelete({ recruiter_id: req.user._id })
            res.status(201).send({ msg: "Recruiter Account Deleted", status: 201 })
        } else {
            res.status(400).send("User Not Exist ")
        }
    } catch (error) {
        console.log(`Error from the recruiter delete Account==>${error}`)
    }
}


const cmpCreate = async (req, res) => {
    try {
        const { cmp_name, cmp_tagline, cmp_owner, jobcatogory, phonenumber, landline, websitelink, zipcode, country, state, city, employess, rec_mno, worktime, cmp_address2, google, twitter, linkdin, esta_date, cmp_email } = req.body;
        const companyToupdate = await Tbl_rec_signup.findByIdAndUpdate({ _id: req.user._id }, {
            $set: req.body
        })
        await companyToupdate.save();
        res.send({ message: "company created successfully", status: 200 })

    }
    catch (error) {
        console.log(error);
        let imageUrl = ''
    }
}

const getrecruiter = async (req, res) => {
    try {
        res.send(req.user);
    }
    catch (error) {
        console.log(error)
    }
}

const checkpayment = async (req, res) => {
    try {
        const id = req.user._id;
        const pay = await tbl_payment.findOne({ paymentby: id })
        const profile = await Tbl_rec_signup.findById({ _id: id })
        if (profile.employess == null) {
            res.status(201).send({ status: 1 })
        } else if (pay == null) {
            res.status(201).send({ status: 2 })
        } else {
            res.status(401).send({ status: 0 })
        }
    } catch (error) {
        console.log('error from  the check payment ', error)
    }
}

const jobpost = async (req, res) => {
    try {
        const data = await tbl_payment.findOne({ paymentby: req.user.id });
        const { jobtitle, gender, designation, salaryrange, vacancy, experience, jobtype, qualification, degree, skill, languageknown, interviewtype, description } = req.body;

        if (jobtitle && gender && designation && salaryrange && vacancy && experience && jobtype && qualification && skill && languageknown && interviewtype && description && degree) {
            const profile = await Tbl_rec_signup.findById({ _id: req.user.id })
            if (profile.employess) {


                if (data) {
                    if (data.packagename == "PLATINUM" && data.jobpostcount >= 4) {
                        res.send({ status: 400, msg: "your jobpost limit over in PLATINUM package" })
                    }
                    else if (data.packagename == "GOLD" && data.jobpostcount >= 2) {
                        res.send({ status: 400, msg: "your jobpost limit over in GOLD package" })
                    }
                    else if (data.packagename == "SILVER" && data.jobpostcount >= 1) {
                        res.send({ status: 400, msg: "your jobpost limit over in SILVER package" })
                    }
                    else {
                        const newJobPost = await Tbl_jobpost.create({
                            postedby: req.user._id,
                            jobtitle: jobtitle,
                            gender: gender,
                            designation: designation,
                            degree: degree,
                            salaryrange: salaryrange,
                            vacancy: vacancy,
                            experience: experience,
                            jobtype: jobtype,
                            qualification: qualification,
                            skill: skill,
                            languageknown: languageknown,
                            interviewtype: interviewtype,
                            description: description
                        });
                        await tbl_payment.findOneAndUpdate({ paymentby: req.user.id }, { $inc: { jobpostcount: 1 } }, { new: true });
                        res.send({ status: 200, msg: "Job Post Successfully" })
                    }
                } else {
                    res.status(400).send({ msg: "YOu have not Buy Any Subscription Please Buy!", status: 100 })
                }
            } else {
                res.status(400).send({ msg: "Please Complete your Profile First!", status: 101 })
            }
        } else {
            console.log("All Fileds Are Required!!")
            res.send("All Fileds Are Required!!")
        }


    } catch (error) {
        console.log(`Error in Job Post ${error}`)
        res.send(`something wrong`);
    }
}

const getOwnJobpost = async (req, res) => {
    try {
        const response = await Tbl_jobpost.find({ postedby: req.user._id, isDeleted: { $eq: true } })//.sort(created = -1);//.select('-postedby');
        res.send(response);
    } catch (error) {
        console.log(error);
    }
}
//11/3/23
const restorejobPost = async (req, res) => {
    try {
        if (!req.body) res.send('data not found')
        const jobid = req.params.id;
        await Tbl_jobpost.findByIdAndUpdate({ _id: jobid }, { $set: { isDeleted: false } }, { new: true })
        res.send({ message: "Remove success", status: 200 });
    } catch (error) {
        res.send("somethong wrong")
    }
}

const updaterestorejobpost = async (req, res) => {
    try {
        if (!req.body) {
            res.send('adata not found')
        }
        const jobid = req.params.id;
        console.log(jobid)
        await Tbl_jobpost.findByIdAndUpdate({ _id: jobid }, { $set: { isDeleted: true } })
        res.status(201).send({ message: "Job Post Restored", status: 201 });
    } catch (error) {
        console.log(`Error from the update restore job post`)
        res.send("somethong wrong")
    }
}

const deletejobPost = async (req, res) => {
    try {
        if (!req.body) {
            res.send('adata not found')
        }
        const jobid = req.params.id;
        console.log(`post id ==>${jobid}`)
        await Tbl_jobpost.findByIdAndDelete({ _id: jobid })
        console.log('post deleted')
        res.status(201).send({ message: "Remove success", status: 201 });
    } catch (error) {
        res.send("somethong wrong")
    }
}

const trashgetOwnJobpost = async (req, res) => {
    try {
        const response = await Tbl_jobpost.find({ postedby: req.user._id, isDeleted: { $ne: true } })//.sort(created = -1);//.select('-postedby');
        res.send(response);
    } catch (error) {
        console.log(error);
    }
}

const getperticularJob = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id)
        const data = await Tbl_jobpost.findOne({ _id: id }).populate('postedby')
        if (data == null) {
            res.status(400).send({ err: "Data not avaiable" })
        } else {
            res.send({ message: "success", data: data });
        }

        console.log("id====>", id)
    } catch (error) {
        console.log(error)
    }
}

const updatejob = async (req, res) => {
    try {
        const updateid = req.params.id;
        const bodydata = req.body;
        console.log(bodydata);

        if (!req.body) {
            res.status(400).send("data not found",);
        }
        else {
            const result = await Tbl_jobpost.findByIdAndUpdate({ _id: updateid }, {
                $set: bodydata
            })
            res.send({ message: 'job update success', status: 200 })
        }
    } catch (error) {
        console.log(`Error from the update job ${error}`)
        res.send(error)
    }
}

// send mail from recruiter for passgot
var recmail = async (req, res) => {
    const { cmp_email } = req.body;
    try {
        console.log("aagal nathi vadhtu ")

        const Match = await Tbl_rec_signup.findOne({ cmp_email: cmp_email })
        if (Match) {
            const OTP = Math.floor(100000 + Math.random() * 900000)
            const emailMatch = await recruiterotp.findOne({ cmp_email })
            if (emailMatch) {
                const updateotp = await recruiterotp.findOneAndUpdate({ cmp_email }, { $set: { otp: OTP } }, { new: true })
                await updateotp.save();
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: cmp_email,
                    subject: "OTP For Forgot Password",
                    text: `Your OTP is  :- ${OTP}`
                }

                transporter.sendMail(mailOptions, async (error, info) => {
                    if (error) {
                        console.log(`Email sent :- ${JSON.stringify(info)}`)
                        await res.status(201).json({ status: 201 })

                    } else {
                        console.log(`Email sent :- ${info}`)
                        await res.status(201).json({ info, status: 201 })
                    }
                })
            } else {
                const saveOpt = await recruiterotp.create({
                    cmp_email: req.body.cmp_email, otp: OTP
                })
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: cmp_email,
                    subject: "OTP For Forgot Password",
                    text: `Your OTP is  :- ${OTP}`
                }
                transporter.sendMail(mailOptions, async (error, info) => {
                    if (error) {
                        console.log("Error", error)
                        res.status(401).json({ err: "Email Id Not Exist In Job's Hub", status: 401 })
                    } else {
                        console.log(`Email sent :- ${JSON.stringify(info)}`)
                        await res.status(201).json({ status: 201 })
                    }
                })
            }
        } else {
            console.log("user not found")
            res.status(401).json({ msg: "not found", status: 401 })
        }
    } catch (error) {
        console.log(`Error in mail auth :- ${error}`)
    }
}

var recruiterverifyotp = async (req, res) => {
    try {
        console.log("recruiter email ", req.body.cmp_email)
        const { otp, cmp_email } = req.body
        const match = await recruiterotp.findOne({ cmp_email: req.body.cmp_email })
        console.log("matched", match)
        if (match) {
            if (otp === match.otp) res.status(201).send({ status: 201, msg: "OTP is Verify" })
            else res.status(400).send({ msg: "Invalid OTP ", status: 400 })
        }
    } catch (error) {
        console.log("into catch")
        res.status(400).send({ status: 400, error })
    }
}

var recruiterforgot = async (req, res) => {
    const { cmp_email, newpwd, conpwd } = req.body
    try {
        const valid = await recruiterotp.findOne({ cmp_email: cmp_email });
        console.log(`valid form the recruiter forgot   ${valid}`)
        if (valid) {
            const match = await Tbl_rec_signup.findOne({ cmp_email: cmp_email })
            const salt = await bcrypt.genSalt(12)
            const secPass = await bcrypt.hashSync(newpwd, salt)

            const updatepass = await Tbl_rec_signup.findOneAndUpdate(
                { cmp_email: cmp_email },
                { $set: { cmp_pwd: secPass } },
                { new: true }
            );
            await updatepass.save();
            res.status(201).send({ msg: "Password Changed", status: 201 })
        } else {
            res.status(401).send({ msg: "Please Try Again", status: 401 })
        }
    } catch (error) {
        console.log("catch from the seekerforgot", error)
        res.status(401).send({ status: 401, error })
    }
}

var recchangepassword = async (req, res) => {
    try {
        const { oldpwd, updatedpass, updateconpass } = req.body
        console.log(req.body)
        console.log("chal saru kr password change karvanu ")
        console.log(`---->${req.user.id}`);
        const match = await Tbl_rec_signup.findById({ _id: req.user.id })
        // console.log(match)
        if (match) {
            console.log("matched")
            console.log(req.body.oldpwd)
            const passverify = await bcrypt.compare(oldpwd, match.cmp_pwd)
            console.log(passverify)
            if (passverify) {
                const oldnewmatch = await bcrypt.compare(updatedpass, match.cmp_pwd);
                if (oldnewmatch) res.status(401).send({ status: 401, err: "New Password & Old Password  Always Diferent" })
                if (updatedpass && updateconpass) {
                    console.log("ready to update")
                    if (updatedpass === updateconpass) {
                        const salt = await bcrypt.genSalt(12)
                        const securePass = await bcrypt.hash(updatedpass, salt)
                        const newPass = await Tbl_rec_signup.findByIdAndUpdate({ _id: req.user._id }, { $set: { "cmp_pwd": securePass } })
                        newPass.save()
                        res.status(201).send({ status: 201, newPass, msg: "Password Chanege Successfully" })
                        console.log("success")
                    } else {
                        res.status(401).send({ status: 401, err: "New Password & Confirm Password Always same" })
                    }
                } else {
                    res.status(401).send({ status: 401, err: "All Field require" })
                }
            } else {
                console.log("pass not matched")
                res.status(401).send({ status: 401, err: "Old Password Not matched" })
            }
        }
    } catch (error) {
        console.log(`Error from the Change Password ---> ${error} `)
    }
}


var manageindustry = async (req, res) => {
    try {
        const data = await Tbl_industry.find({})
        res.status(201).send(data)
    } catch (error) {
        console.log(`Error from the manageindustry :- ${error}`)
    }
}

const getappliedUser = async (req, res) => {
    try {
        console.log(req.user._id);
        const response = await Tbl_jobapply.find({ rec_id: req.user._id, show: true }).populate('js_id');
        const result = await response.filter((item) => item.accept == 0)
        res.send(result);
    } catch (error) {
        console.log(error);
    }
}

const AcceptUserList = async (req, res) => {
    try {
        console.log(req.user._id);
        const response = await Tbl_jobapply.find({ rec_id: req.user._id }).populate('js_id');
        const result = await response.filter((item) => item.accept == 1)
        res.send(result);
        console.log("result----->", result)
    } catch (error) {
        console.log(error);
    }
}


const RejectUserList = async (req, res) => {
    try {
        console.log(req.user._id);
        const response = await Tbl_jobapply.find({ rec_id: req.user._id }).populate('js_id');
        const result = await response.filter((item) => item.accept == 2)
        res.send(result);
    } catch (error) {
        console.log(error);
    }
}

const acceptRequest = async (req, res) => {
    const jobid = req.params.id;
    try {
        const result = await Tbl_jobapply.findByIdAndUpdate({ _id: jobid }, { accept: 1 });
        await result.save();
        res.send({ message: "accept requestr successfully", status: 200 })
    }
    catch (error) {
        res.send("sometiong wrong")
    }
}

var acceptmail = async (req, res) => {
    try {
        const id = req.params.id
        const seekerid = await Tbl_jobapply.findById({ _id: id }, { _id: 1 }).populate('js_id')
        const sekmail = seekerid.js_id.js_email
        if (sekmail) {
            const mailOptions = {
                from: process.env.EMAIL,
                to: sekmail,
                subject: "🥳🥳 Your Job Application Accept 🥳🥳",
                text: `We are most happy to appoint as a Developer . Plz Quikly contact our HR for interview`
            }
            transporter.sendMail(mailOptions, async (error, info) => {
                if (error) {
                    await res.status(401).json({ err: "error", status: 401 })
                } else {
                    console.log(`Email sent :- ${info}`)
                    await res.status(201).json({ info, status: 201 })
                }
            })
        }
    } catch (error) {
        console.log(`Error from the accept mail send :==> ${error}`)
    }
}

const rejectRequest = async (req, res) => {
    const jobid = req.params.id;
    try {
        const result = await Tbl_jobapply.findByIdAndUpdate({ _id: jobid }, { accept: 2 });
        await result.save();
        res.send({ message: "accept requestr successfully", status: 200 })
    }
    catch (error) {
        res.send("sometiong wrong")
    }

}

const recruiterreview = async (req, res) => {
    try {
        const rec_id = req.user._id
        const exist = await Tbl_rec_review.findOne({ recruiter_id: rec_id })
        if (exist) {
            const data = await Tbl_rec_review.findOneAndUpdate({ recruiter_id: rec_id },
                {
                    $set: { ratingstar: req.body.ratingstar, review: req.body.review }
                }, { new: true })
            res.status(201).send({ status: 201, data: data, msg: "review send" })
        } else {
            const data = await Tbl_rec_review.create({
                recruiter_id: rec_id,
                ratingstar: req.body.ratingstar,
                review: req.body.review
            })
            res.status(201).send({ status: 201, data: data, msg: "review send" })
        }
    } catch (error) {
        console.log(`Error from the send msg:===> ${error} `)
    }
}

var getrecruiterreview = async (req, res) => {
    try {
        const id = req.user._id;
        const data = await Tbl_rec_review.findOne({ recruiter_id: id })
        if (data != null) res.status(201).send({ status: 1, data })
        else res.status(201).send({ status: 2 })
    } catch (error) { }
}

// %%%%%%%%%%%%%%%%%%%%%%%%%   SEARCH JOB   %%%%%%%%%%%%%%%%%%%%%%%%%

var jobtype = async (req, res) => {
    try {
        const jobtype = req.body.jobtype
        if (!jobtype) res.status(401).send({ error: "All Field Required", status: 400 })
        else {
            const job = await Tbl_jobpost.find({ "jobtype": { $in: [jobtype] } })
            res.status(201).send({ job, status: 201 })
        }
    } catch (error) {
        res.status(401).send({ error: `Error from the jobtype ==> ${error} ` })
    }
}

var location = async (req, res) => {
    try {
        const location = req.body.location
        if (location) {
            const job = await Tbl_jobpost.find({ "joblocation": { $in: [location] } })
            if (job == "") res.status(401).send({ error: "Job Not Available on This Place", status: 401 })
            else res.status(201).send({ job, status: 201 })
        } else res.status(401).send({ error: "All Field Required", status: 401 })
    } catch (error) {
        res.status(401).send({ error: `Error from the jobtype ==> ${error} ` })
    }
}

var exportcsv = async (req, res) => {
    try {
        const token = req.params.token
        const id = jwt.verify(token, process.env.SECRETE_KEY);
        const result = await Tbl_jobapply.find({ rec_id: id.cmpid }, { accept: 1 }).populate("js_id");
        const csvStream = csv.format({ headers: true })
        if (!fs.existsSync("public/files/export")) {
            if (!fs.existsSync("public/files")) {
                fs.mkdirSync("./public/files/")
            }
            if (!fs.existsSync("public/files/export")) {
                fs.mkdirSync("./public/files/export")
            }
        }
        const writablestream = fs.createWriteStream("public/files/export/user.csv")
        csvStream.pipe(writablestream)
        writablestream.on("finish", function () {
            res.json({ downloadurl: `https://jobshubback-19af.onrender.com/files/export/user.csv` })
        })

        if (result.length > 0) {
            result.map((user) => {
                console.log(user)
                csvStream.write({
                    Name: user.js_id.js_name ? user.js_id.js_name : "-",
                    EmailId: user.js_id.js_email ? user.js_id.js_email : "-",
                    ContactNo: user.js_id.js_mno ? user.js_id.js_mno : "-"
                })
            })
        }
        csvStream.end();
        writablestream.end();
    } catch (error) {
        console.log("error fro the export csv catch", error)
        res.status(400).send({ err: `something is error =>>${error}` })
    }
}

const order = (req, res) => {
    var instance = new Razorpay({
        key_id: process.env.KEY_ID,
        key_secret: process.env.KEY_SECRET,
    });

    console.log("amount--->", req.body)
    console.log("amount--->", req.body.amount * 100)

    var options = {
        amount: req.body.amount * 100,  // amount in the smallest currency unit
        currency: "INR",
    };
    instance.orders.create(options, function (err, order) {
        if (err) {
            res.send({ status: 500, message: "order failed" })
        }
        else {
            res.send({ status: 200, message: "order created", data: order })
        }
    });
}

const verify = async (req, res) => {
    try {
        let body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
        var expectedSignature = crypto.createHmac("sha256", process.env.KEY_SECRET).update(body.toString()).digest('hex');
        if (expectedSignature === req.body.razorpay_signature) {
            console.log('rec id from the payment ', req.user.id)
            user = await tbl_payment.findOne({ paymentby: req.user.id });
            if (user) {
                const result = await tbl_payment.findOneAndUpdate({
                    paymentby: req.user.id
                }, {
                    packagename: req.body.packagename,
                    amount: req.body.amount,
                    jobpostcount: 0,
                    payment_id: req.body.razorpay_payment_id
                })
                res.send({ message: "payment success", status: 200 })
            } else {
                result = await tbl_payment({
                    paymentby: req.user.id,
                    packagename: req.body.packagename,
                    jobpostcount: 0,
                    ispaid: "done",
                    payment_id: req.body.razorpay_payment_id
                })
                await result.save();
                res.send({ message: "payment success", status: 200 })
            }
        }
        else res.send({ message: "payment failed", status: 400 })
    } catch (error) {
        console.log(error)
    }
}

// @@@@@@@@@@  ADMIN GET INFORMATION OF RECRUITER & SEEKER  @@@@@@@@@@

var seekercon = async (req, res) => {
    try {
        const pay = await Tbl_js_contact.find({}).populate('seeker_id');
        res.status(200).send(pay)
    } catch (error) {
        console.log(error)
    }
}

var recruitercon = async (req, res) => {
    try {
        const pay = await tbl_rec_contact.find({}).populate('rec_id');
        res.status(200).send(pay)
    } catch (error) {
        console.log(error)
    }
}

var payment = async (req, res) => {
    try {
        const pay = await tbl_payment.find({}).populate('paymentby');
        res.status(200).send(pay)
    } catch (error) {
        console.log(error)
    }
}
var recruiterlist = async (req, res) => {
    try {
        const data = await Tbl_rec_signup.find({}, { cmp_name: 1, cmp_email: 1, rec_mno: 1, isBlock: 1 }).limit(10);
        res.status(201).send(data)
    } catch (error) {
        console.log(`Error from the Recruiterlist :- ${error}`)
    }
}

var reclist = async (req, res) => {
    try {
        const data = await Tbl_rec_signup.find({});
        res.status(201).send(data)
    } catch (error) {
        console.log(`Error from the Recruiterlist :- ${error}`)
    }
}

var seekerlist = async (req, res) => {
    try {
        const data = await Tbl_js_signup.find({}, { js_name: 1, js_email: 1, js_mno: 1, isBlock: 1 }).limit(10);
        res.status(201).send(data)
    } catch (error) {
        console.log(`Error from the Recruiterlist :- ${error}`)
    }
}

var seeklist = async (req, res) => {
    try {
        const data = await Tbl_js_signup.find({});
        res.status(201).send(data)
    } catch (error) {
        console.log(`Error from the Recruiterlist :- ${error}`)
    }
}

var totalrecruiterlist = async (req, res) => {
    try {
        const data = await Tbl_rec_signup.find({}, { cmp_name: 1, cmp_email: 1, rec_mno: 1 });
        res.status(201).send(data)
    } catch (error) {
        console.log(`Error from the Recruiterlist :- ${error}`)
    }
}

var totalseekerlist = async (req, res) => {
    try {
        const data = await Tbl_js_signup.find({}, { js_name: 1, js_email: 1, js_mno: 1 });
        res.status(201).send(data)
    } catch (error) {
        console.log(`Error from the Recruiterlist :- ${error}`)
    }
}

//recruiter delete 
var recruiterlistdel = async (req, res) => {
    try {
        const { id } = req.params;
        const del = await Tbl_rec_signup.findByIdAndDelete({ _id: id })
        res.send({ message: "Recruiter Deleted", status: 201 });
    } catch (error) {
        console.log(`Error from the recruiter delete :---> ${error}`)
    }
}

// seeker delete 
var seekerlistdel = async (req, res) => {
    try {
        const { id } = req.params;
        const del = await Tbl_js_signup.findByIdAndDelete({ _id: id })
        res.send({ message: "Seeker Deleted", status: 201 });
    } catch (error) {
        console.log(`Error from the recruiter delete :---> ${error}`)
    }
}


var getseekercon = async (req, res) => {
    const getcontact = await Tbl_js_contact.find({});
    res.status(200).send({ getcontact })
}

var adsignup = async (req, res) => {

    try {
        const { adminpwd, adminemail } = req.body
        const admindata = new Tbl_admin({ adminemail, adminpwd });

        const salt = await genSalt(12);
        const secAdminPwd = await hash(adminpwd, salt);
        const data = await create({
            adminemail: req.body.adminemail,
            adminpwd: secAdminPwd
        })
        // const result = data.json();
        console.log(`Admin Created :- ${data}`);
        if (data) {
            res.send({ status: 200, data, msg: " Inserted successfully..." });
        }
    } catch (err) {
        console.log(`ky locho in Sign up :- ${err}`)
        return res.json({ status: 400, err: "Something is wrong" })
    }

}

var adSignin = async (req, res) => {
    console.log('hlw from login')
    try {
        const { adminemail, otp } = req.body;
        if (!otp || !adminemail) {
            res.status(400).send({ status: 400, error: "Please Enter Your OTP and Email" })
        }
        const otpverify = await Otp.findOne({ adminemail: adminemail })

        if (otpverify.otp === otp) {
            const user = await Tbl_admin.findOne({ adminemail: adminemail })

            const token = await jwt.sign({ _id: user._id }, process.env.SECRETE_KEY)
            res.status(201).send({ status: 201, msg: "Signin Successfully", tok: token })

        } else {
            res.status(400).send({ status: 400, error: "Invalid OTP" })
        }

    } catch (error) {
        console.log(error)
        res.status(400).send({ error: `Error from the Admin signin --->>>${error}` })
    }
}

var addindustry = async (req, res) => {
    try {
        const { ind_name } = req.body;
        if (ind_name) {
            const match = await Tbl_industry.findOne({ ind_name });
            if (match) {
                res.send({ status: 101, msg: "Industry Already Available" });
            } else {
                const data = await Tbl_industry.create({ ind_name: req.body.ind_name })
                if (data) res.send({ status: 200, msg: "Industry Added Successful" })
                else res.send({ status: 400, error: "Industry Not Added" })
            }
        } else res.send({ status: 400, error: "All Fields Required" })
    } catch (error) {
        console.log(`Error in the industry manage ${error}`);
    }
}

var recruiterdata = async (req, res) => {
    try {
        console.log(Tbl_rec_signup);
        console.log("data====>", 88)
        const alldata = await find({}).limit(10)//, { cmp_name: 1, cmp_email: 1 })
        const result = await alldata.json();
        res.send(result);
    } catch (error) {
        console.log(`Error in admin recruiter list :- ${error}`)
    }
}

var getseekercon = async (req, res) => {
    try {
        const getcontact = await Tbl_js_contact({});
        res.status(200).send({ getcontact })
    } catch (error) {
        console.log(error)
    }

}

var sendotp = async (req, res) => {
    const { adminemail } = req.body
    if (!adminemail) res.status(400).send({ error: "Please Enter Your Email" });
    try {
        const preuser = await Tbl_admin.findOne({ adminemail: req.body.adminemail });
        if (preuser) {
            const OTP = Math.floor(100000 + Math.random() * 900000)
            console.log(`otp==> ${OTP}`)
            const existEmail = await Otp.findOne({ adminemail: adminemail })
            if (existEmail) {
                const updateData = await Otp.findByIdAndUpdate({ _id: existEmail._id }, { otp: OTP }, { new: true })
                await updateData.save();
                const mailOption = {
                    from: process.env.EMAIL,
                    to: adminemail,
                    subject: "VerificationOTP for Signin",
                    text: `OTP :- ${OTP}`
                }

                transporter.sendMail(mailOption, async (error, info) => {
                    if (error) {
                        console.log(`Error==> ${error}`)
                        await res.status(401).json({ err: "error", status: 401 })
                    } else {
                        console.log(`Email sent :- ${info}`)
                        await res.status(201).json({ info, status: 201 })
                    }
                })
            } else {
                console.log("hlw from else ")
                const saveOtpData = await Otp.create({
                    adminemail: req.body.adminemail,
                    otp: OTP
                })
                const mailOption = {
                    from: process.env.EMAIL,
                    to: adminemail,
                    subject: "VerificationOTP for Signin",
                    text: `OTP :- ${OTP}`
                }

                transporter.sendMail(mailOption, async (error, info) => {
                    if (error) {
                        console.log(`Error==> ${error}`)
                        await res.status(401).json({ err: "error", status: 401 })
                    } else {
                        console.log(`Email sent :- ${info}`)
                        await res.status(201).json({ info, status: 201 })
                    }
                })
            }
        } else {
            res.status(400).send({ error: "This user is not exist " });
        }
    } catch (error) {
        console.log(`Error from the otp send :--> ${error}`);
    }
}


var viewindustry = async (req, res) => {
    try {
        const view = await Tbl_industry.find()
        res.status(201).send(view)
    } catch (error) {
        console.log(`Error from the view industry ===>${error}`)
    }
}

var seekerblock = async (req, res) => {
    try {
        const blockId = req.params.id
        const block = await Tbl_js_signup.findByIdAndUpdate({ _id: blockId },
            {
                $set: { isBlock: 1 }
            }, { new: true })
        await block.save()
        res.status(201).send({ status: 201, msg: "this Seeker Blocked" })
    } catch (error) {
        console.log(`Error from the seeker block ${error}`)
    }
}

var recruiterblock = async (req, res) => {
    try {
        const blockId = req.params.id
        const block = await Tbl_rec_signup.findByIdAndUpdate({ _id: blockId },
            {
                $set: { isBlock: 1 }
            }, { new: true })
        await block.save()
        res.status(201).send({ status: 201, msg: "this Recruiter Blocked" })
    } catch (error) {
        console.log(`Error from the seeker block ${error}`)
    }
}

var getseekerreviewall = async (req, res) => {
    try {
        const data = await Tbl_js_review.find().populate('seeker_id')
        res.status(201).send(data)
    } catch (error) { }
}
var getrecruiterreviewall = async (req, res) => {
    try {
        const data = await Tbl_rec_review.find().populate('recruiter_id')
        res.status(201).send(data)
    } catch (error) { }
}

// %%%%%%%%%%%%%%% Only For Showing Perpose %%%%%%%%%%%%%%%

var jobs = async (req, res) => {
    try {
        const jobs = await Tbl_jobpost.find({}).populate('postedby');
        res.status(201).send(jobs);
    } catch (error) {
        console.log(`Error from the jobs:=${error}`)
    }
}

const download = () => {
    pdf.create(pdfTemplate(req.body), { childProcessOptions: { env: { OPENSSL_CONF: '/dev/null' } } }).toFile('rezultati.pdf', (err) => {
        if (err) return console.log('error');
        res.send(Promise.resolve())
    });
}

const downloadResume = () => {
    res.sendFile(`${__dirname}/rezultati.pdf`);
}

const createPaymentReceipt = () => {
    const paymentdata = tbl_payment.find({ paymentby: req.user._id })
    pdf.create(PaymentReceiptTemplate(paymentdata), {}).toFile('rezultati.pdf', (err) => {
        if (err) return console.log('error');
        res.send(Promise.resolve())
    });
}

const downloadPaymentReceipt = () => { res.sendFile(`${__dirname}/rezultati.pdf`); }

module.exports = {
    router,
    // seeker 
    signup, signin,
    getseeker, updateprofile,
    updateimage, js_contact,
    applyjob, Changepassword, mail,
    seekerforgot, seekerotpverify,
    seekerapplydel, seekerreview,
    jobdetail, jobhistory,
    jobapplyrestore, rejectRequest,
    getjobedu, download,
    downloadResume, sekdeleteaccount,
    jobhistoryaccept, jobhistoryreject,

    // recruiter
    cmpupdatelogo, seekercontact,
    cmpRegistration, cmpLogin,
    reccontact, cmpCreate,
    getrecruiter, get_contact,
    getjobpost, recruiterlist,
    jobpost, getOwnJobpost,
    deletejobPost, getperticularJob,
    updatejob, checkpayment,
    recruiterverifyotp,
    jobbackup, restorejob,
    recmail, recruiterforgot,
    recchangepassword, manageindustry,
    recdeleteaccount, createPaymentReceipt,
    downloadPaymentReceipt,
    acceptRequest, RejectUserList,
    AcceptUserList, getappliedUser,
    exportcsv, order, verify,

    // admin
    seekerlist, seekerlistdel,
    recruiterlistdel, acceptmail,
    sendmsg, trashgetOwnJobpost,
    restorejobPost, updaterestorejobpost,
    getseekerreview, recruiterreview,
    getrecruiterreview, getseekerreviewall,
    getrecruiterreviewall,
    seeklist, reclist,

    // job searh
    jobtype, location, jobs,
    getseekercon,
    homeviewindustry, totalrecruiterlist,
    totalseekerlist, payment,
    // Admin Side
    adsignup, adSignin, addindustry,
    recruiterdata, sendotp,
    getseekercon, viewindustry,
    seekerblock, recruiterblock,
    seekercon, recruitercon,
    // back up & restore
    seekerbackup,
} 