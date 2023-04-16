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
// const authenticate = require("../mid=dleware/authentication");
const cookie = require("cookie-parser");//Cookie
// const Tbl_jobpost = require("../models/jobPost");
const Tbl_jobapply = require("../models/jobapplaySchema");
app.use(cookie);
const nodemailer = require("nodemailer");
const Tbl_industry = require("../models/industrySchema")
const csv = require("fast-csv")
// const Razorpay = require("razorpay")
const Razorpay = require('razorpay')
const crypto = require("crypto")
const tbl_payment = require("../models/PaymentSchema")
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require("passport")
const Tbl_admin = require("../models/adminSchema")
const Otp = require("../models/otp")
// const Tbl_industry = require("../model/indusrty");
const axios = require("axios");
const pdfTemplate = require('../documentjs/document');
const PaymentReceiptTemplate = require('../documentjs/bill')



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
            // { $unwind: "$seeker_apply_data" },
            {
                $lookup: {
                    from: "Tbl_js_review",
                    localField: "_id",
                    foreignField: "seeker_id",
                    as: "seeker_review_data"
                }
            },
            // { $unwind: "$seeker_review_data" },
            // {
            //     $match: {

            //     }
            // },
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
var signingoogle = (app) => {


    app.get("/auth/google/callback",
        passport.authenticate('google', {
            successRedirect: "http://localhost:3000/seekerhome",
            failureRedirect: "/login/failure"
        },
            // (req, res) => {
            //     if (req.existuser) {
            //         res.status(200).send({ user: existuser })
            //     } else {
            //         res.status(200).send({ newuser })
            //     }
            // }
        ));
    app.get('/auth/google',
        passport.authenticate('google', { scope: ['profile', 'email'] }));
}


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
                    // const token = await jwt.sign(Tbl_js_signup.id, process.env.SECRETE_KEY);
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

                                // const data = {
                                //     message: JSON.stringify(`Thank You For Registration in Job's Hub.\n Here Is your Username And Password :
                                //                     Username:   ${js_email}
                                //                     Password: ${js_pwd}  \n PLEASE DO NOT SHARE WITH ANYONE `),
                                //     media: "[]",
                                //     delay: "0",
                                //     schedule: "",
                                //     numbers: `${js_mno}`
                                // };
                                // try {
                                //     const response1 = axios.post('http://api.wapmonkey.com/send-message', data, {
                                //         headers: {
                                //             Authorization: "U2FsdGVkX18OcI6GLPW3UzEyf/kYC4zaqtN95dqLF80BUMqQgn+mJxEN84nuGZ/jR/kcd5thJzWPKstgzsjWJQ=="
                                //         }
                                //     });

                                // } catch (error) {
                                //     console.error(error);
                                //     throw new Error('Failed to send message');
                                // }
                            }
                        })
                    }

                    console.log(data);
                    if (data) {
                        // await mailsendsignup(js_email, js_pwd, js_mno)
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
                            // token = await user.generateToken();
                            // res.cookie('jwtseeker', token, { expires: new Date(Date.now() + 25892000000), httpOnly: true });
                            // console.log(`Token thay gayu 6 :- ${user.token}`);
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
                // console.log(user)

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
            const passMatch = await bcrypt.compare(req.body.rec_pwd, match.js_pwd);
            if (passMatch) {
                const recdel = await Tbl_js_signup.findByIdAndDelete({ _id: id });
                const apply = await Tbl_jobapply.findOneAndDelete({ js_id: id });
                const con = await Tbl_js_contact.findOneAndDelete({ seeker_id: id });
                await recdel.save()
                res.status(201).send({ msg: "Recruiter Account Deleted" })
            } else {
                res.status(400).send("Password Not Match")
            }
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
        // console.log("hii")
        const id = req.user.id
        // console.log(id)
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
        // console.log(`file ==>${req.file.filename}`)
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
        // let url = req.files.filename;
        // const imageUrl = `./public/uploads1/seekerprofile/${url}`;
        // console.log("image url===>", imageUrl);
        // await fs.unlinkSync(imageUrl);
    }

    //     if (match) {
    //         console.log("Match")
    //         const updatePic = await Tbl_js_signup.findByIdAndUpdate(
    //             { _id: req.user.id },
    //             {
    //                 $set: {
    // js_profile
    //                 }
    //             }
    //         )
    //     }
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
    const jo = req.user.js_quli || ""
    const search = req.query.search || ""
    const gender = req.query.gender || ""
    const range = req.query.range || ""
    const jobtype = req.query.jobtype || ""
    const isDeleted = null
    console.log(`Job Type :===>${isDeleted}`)
    const query = {
        jobtitle: {
            $regex: search//, $option: 'i'
        }
        // jobtitle: { '$regex': new RegExp(search, "i").toString() }
    }
    if (gender) {
        query.gender = gender
    }
    if (range) {
        query.range = range
    }
    if (jobtype) {
        query.jobtype = jobtype
    }
    // if (isDeleted) {
    //     query.isDeleted = isDeleted
    // }

    try {
        const match = await Tbl_jobpost.aggregate([
            {
                $lookup: {
                    from: "Tbl_rec_signup",
                    localField: "postedby",
                    foreignField: "_id",
                    as: "Post Data"
                },
            },
            {
                $unwind: "$Post Data"
            }
        ])
        console.log(`job match===>${match}`)
        if (match) {

            res.status(200).send(match)
        } else {
            res.status(400).send("Not Match")
        }


        // const job = await Tbl_jobpost.find({ "qualification": { $in: [jo] } }).populate('postedby');
        // const job = await Tbl_jobpost.find({ query, isDeleted: { $eq: null } }).populate('postedby');
        // const job = await Tbl_jobpost.find(query).populate('postedby');
        // console.log(`Posted job ----->${job}`);
        // res.status(200).send(job)
    } catch (error) {
        console.log(`Error in Gegt Job Post :- ${error}`);
    }
}
const getjobedu = async (req, res) => {
    try {
        const jo = req.user.js_quli
        const job = await Tbl_jobpost.find({ "qualification": { $in: [jo] } }).populate('postedby');
        // const job = await Tbl_jobpost.find({},{ $in: { "qualification": jo } }).populate('postedby');
        console.log(`Posted job ----->${job}`);
        res.status(200).send(job)
    } catch (error) {
        console.log(`Error in Gegt Job Post :- ${error}`);
    }
}

// var applyjob = async (req, res) => {
//     try {
//         const rec_id = req.body.recid
//         // const rec_id = req.params.id
//         const js_id = req.user.id

//         console.log("body====>", req.body)
//         const resume = req?.file?.filename
//         console.log('out of condition  Resume', resume)

//         if (js_id && rec_id && resume) {
//             console.log('into condition ')
//             const data = await Tbl_jobapply.create({
//                 js_id: js_id,
//                 rec_id: rec_id,
//                 resume: resume,
//                 accept: 0
//             })
//             console.log("resume uploaded")
//             res.status(201).send({ data, status: 201 })

//         } else {
//             console.log("ALL Field Required")
//         }

//     } catch (error) {
//         console.log(`error ${error}`);
//     }
// }

// Forgot Password  &&& Change Password 

// var applyjob = async (req, res) => {
//     console.log("bodydata----<", req.body)
//     try {
//         const rec_id = req.body.recid
//         const js_id = req.user.id
//         console.log(js_id)
//         // console.log(req.from.filename)
//         const resume = req?.files?.filename
//         console.log('out of condition ', resume)
//         // const resume = req.body.resume
//         const aplydata = new Tbl_jobapply({ js_id, rec_id, resume })
//         console.log("Apply Data ", aplydata)
//         if (js_id && rec_id && resume) {
//             console.log('into condition ')
//             const data = await Tbl_jobapply.create({
//                 js_id: js_id,
//                 rec_id: rec_id,
//                 resume: resume,
//                 accept: 0
//             })
//             res.status(201).send({ data, status: 201 })

//         } else {
//             console.log("All fields Required")
//         }

//     } catch (error) {
//         console.log(`error ${error}`);
//     }
// }


var applyjob = async (req, res) => {
    try {
        const rec_id = req.params.id
        const js_id = req.user.id
        console.log(js_id)
        // console.log(req.from.filename)
        const resume = req.file.filename
        console.log('out of condition ')
        // const resume = req.body.resume
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

var getseekerforgot = async (req, res) => {
    const { id, token } = req.params;

    try {
        console.log(`param====> ${req.params.id}`)
        const valid = await Tbl_js_signup.findOne({ _id: id });
        console.log(`valid====>${valid}`);
        const verifyToken = jwt.verify(token, process.env.SECRETE_KEY);
        console.log(`token====>${token}`);
        if (valid && verifyToken._id) {
            console.log("varify")
            res.status(201).send({ status: 201, valid })
        } else {
            console.log("varify not")
            res.status(401).send({ status: 401, error: "user no varify" })
        }
    } catch (error) {
        console.log("into catch")
        res.status(401).send({ status: 401, error })
    }
}

var seekerforgot = async (req, res) => {
    const { id, token } = req.params
    console.log("start  from the seekerforgot")
    const { js_pwd } = req.body
    try {
        const valid = await Tbl_js_signup.findOne({ _id: id });
        console.log(`valid form the seekerforgot  ${valid}`)
        const verifyToken = jwt.verify(token, process.env.SECRETE_KEY);
        if (valid && verifyToken._id) {
            const newpassword = await bcrypt.hash(js_pwd, 12);

            const setNewUserPass = await Tbl_js_signup.findByIdAndUpdate({ _id: id }, { js_pwd: newpassword })
            setNewUserPass.save();
            console.log(`UPdated pass ${setNewUserPass}`)
            res.status(201).send({ status: 201, setNewUserPass })
        } else {
            console.log("not from the seekerforgot")
            res.status(401).send({ status: 401, error: "user no varify" })
        }

    } catch (error) {
        console.log("catch from the seekerforgot")
        res.status(401).send({ status: 401, error })
    }
}

//  Get Seeker Applied Job Data 

var jobhistory = async (req, res) => {
    console.log(`out of try ===>${req.user.id}`)
    try {
        const id = req.user.id

        const data = await Tbl_jobapply.find({ js_id: id, show: null }, { show: 0 }).populate('rec_id')

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

        const data = await Tbl_jobapply.find({ js_id: id, show: null, accept: 1 }, { show: 0 }).populate('rec_id')

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

        const data = await Tbl_jobapply.find({ js_id: id, show: null, accept: 2 }, { show: 0 }).populate('rec_id')

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
            // console.log("match")
            const newapply = await Tbl_jobapply.findByIdAndUpdate({ _id: id }, { show: 1 }, { new: true })
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
            // console.log("match")
            const newapply = await Tbl_jobapply.findByIdAndUpdate({ _id: id }, { show: null }, { new: true })
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
    // console.log(`out of try ===>${req.user.id}`)
    try {
        const id = req.user.id
        const data = await Tbl_jobapply.find({ js_id: id, show: { $ne: null } }, { show: 0 }).populate('rec_id').populate('js_id')
        res.status(201).send(data)
        // console.log(data);
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
            // console.log("match")
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
        // console.log("chal saru kr password change karvanu ")
        console.log(req.user.id);
        const match = await Tbl_js_signup.findById({ _id: req.user.id })

        if (match) {
            // console.log("matched")
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

var mail = async (req, res) => {
    const { js_email } = req.body;
    try {
        console.log("hiii")
        const emailMatch = await Tbl_js_signup.findOne({ js_email: js_email });
        console.log(emailMatch)
        if (emailMatch) {
            console.log("find")
            // res.status(201).json({ emailMatch })
            const token = jwt.sign({ _id: emailMatch._id }, process.env.SECRETE_KEY, { expiresIn: "600s" });
            console.log(`tokern ${token}`)

            if (token) {
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: js_email,
                    subject: "Testing mail send ",
                    text: `This link valid for 2 min  http://localhost:3000/seekerforgot/${emailMatch._id}/${token}`
                }

                transporter.sendMail(mailOptions, async (error, info) => {
                    if (error) {
                        console.log("Error", error)
                        await res.status(401).json({ err: "error", status: 401 })

                    } else {
                        console.log(`Email sent :- ${info}`)
                        await res.status(201).json({ info, status: 201 })
                    }
                })
            }
        } else {
            console.log("user not found")
            res.status(401).json({ msg: "not found", status: 401 })
        }
        // const transporter = nodemailer.createTransport({
        //     service: "gmail",
        //     auth: {
        //         user: process.env.EMAIL,
        //         pass: process.env.PASS
        //     }
        // });

        // const mailOptions = {
        //     from: process.env.EMAIL,
        //     to: email,
        //     subject: "Testing mail send ",
        //     html: "<h1>Hlw Success</h1>"
        // }

        // transporter.sendMail(mailOptions, (error, info) => {
        //     if (error) {
        //         console.log("Error", error)
        //     } else {

        //         console.log(`Email sent :- ${info}`)
        //         res.status(201).send({ info, status: 201 })
        //     }
        // })

    } catch (error) {
        console.log(`Error in mail auth :- ${error}`)
        // res.status(401).send({  status: 401 })
    }

    // console.log(req.body)
}

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
        // console.log(`file ==>${req.file.filename}`)
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
    }
}

const cmpRegistration = async (req, res) => {
    try {
        const { cmp_email, cmp_pwd, cmp_name, rec_mno } = req.body
        let cmpbody = req.body;
        console.log(req.file)
        cmpbody.cmp_logo = req.file.filename;
        console.log(req.body)
        console.log(cmpbody);

        if (!cmpbody.cmp_name || !cmpbody.cmp_pwd || !cmpbody.cmp_email) {
            return res.status(422).json({ error: "Please fill all the field" });
        }
        const usernameFind = await Tbl_rec_signup.findOne({ cmp_email: cmpbody.cmp_email });
        if (usernameFind) {
            res.status(404).json({ message: "Username already exist" });
            // throws('username already exists')
            // throw new Error(json.message)
        }
        // console.log("----->")
        bcrypt.hash(cmpbody.cmp_pwd, 12, async (err, hash) => {
            cmpbody.cmp_pwd = hash;
            const newcmp = await Tbl_rec_signup.create(cmpbody);
            // newcmp.save();
        });
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
            html: `<p>Here is your <strong>username</strong> and <strong>password</strong>:</p>
                                                <p><strong>Username:</strong>   ${cmp_email}
                                                <p><strong>Password:</strong> ${cmp_pwd}</p>`
        }
        res.status(200).json({ message: "User signup succesfully", status: 201 });

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.log("Error", error)
                await res.status(401).json({ err: "error", status: 401 })
                console.log("transportor error")
            } else {
                console.log(`Email sent :- ${JSON.stringify(info)}`)
                // await res.status(201).json({ info, status: 201 })
                const data = {
                    message: JSON.stringify(`Thank You For Registration in Job's Hub.\n Here Is your Username And Password :
                                  Username:   ${cmp_email}
                                  Password: ${cmp_pwd}  \n PLEASE DO NOT SHARE WITH ANYONE `),
                    media: "[]",
                    delay: "0",
                    schedule: "",
                    numbers: `${rec_mno}`
                };
                try {
                    const response1 = axios.post('http://api.wapmonkey.com/send-message', data, {
                        headers: {
                            Authorization: "U2FsdGVkX18OcI6GLPW3UzEyf/kYC4zaqtN95dqLF80BUMqQgn+mJxEN84nuGZ/jR/kcd5thJzWPKstgzsjWJQ=="
                        }
                    });

                } catch (error) {
                    console.error(error);
                    throw new Error('Failed to send message');
                }
            }
        })



    } catch (error) {
        let url = req.file.filename;
        const imageUrl = `./public/uploads1/companylogo/${url}`;
        fs.unlinkSync(imageUrl);
        console.log("image url===>", imageUrl);
        console.log(`error from the cmp registration ${error}`);
        res.status(400).json({ error: "There is some error" });
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
        const id = req.user._id
        const rec_pwd = req.body
        if (rec_pwd) {


            const match = await Tbl_rec_signup.findById({ _id: id });
            if (match) {
                const passMatch = await bcrypt.compare(req.body.rec_pwd, match.cmp_pwd);
                if (passMatch) {
                    const recdel = await Tbl_rec_signup.findByIdAndDelete({ _id: id });
                    const post = await Tbl_jobpost.findOneAndDelete({ postedby: id })
                    const contact = await tbl_rec_contact.findByIdAndDelete({ postedby: id })
                    res.status(201).send({ msg: "Recruiter Account Deleted" })
                } else {
                    res.status(400).send("Password Not Match")
                }
            } else {
                res.status(400).send("User Not Exist ")
            }
        } else {
            console.log("Password is required")
            // res.send("Passowrd Is Required")
        }
    } catch (error) {
        console.log(`Error from the recruiter delete Account==>${error}`)
    }
}

// const cmpCreate = async (req, res) => {
//     try {
//         const { cmp_name, cmp_tagline, cmp_owner, industry_type, phonenumber, landline, websitelink, zipcode, country, state, city, employess, worktime, cmp_address2, google, twitter, linkdin, esta_date, cmp_email } = req.body;
//         console.log(req.body);
//         // if (!cmp_name || !cmp_tagline || !cmp_owner || !industry_type || !phonenumber || !landline || !websitelink || !zipcode || !country || !state || !city || !employess || !worktime || !cmp_address2 || !google || !twitter || !linkdin || !esta_date || !cmp_email) {
//         //     res.status(400).send("all fields are required");
//         // }
//         console.log("id===>", req.cmp);
//         const companyToupdate = await tbl_registration.findByIdAndUpdate({ _id: req.cmp.id }, {
//             $set: {
//                 cmp_name: cmp_name,
//                 cmp_tagline: cmp_tagline,
//                 cmp_owner: cmp_owner,
//                 industry_type: industry_type,
//                 phonenumber: phonenumber,
//                 landline: landline,
//                 websitelink: websitelink,
//                 zipcode: zipcode,
//                 country: country,
//                 state: state,
//                 city: city,
//                 employess: employess,
//                 worktime: worktime,
//                 cmp_address2: cmp_address2,
//                 google: google,
//                 twitter: twitter,
//                 linkdin: linkdin,
//                 esta_date: esta_date,
//                 cmp_email: cmp_email
//             }
//         })
//         await companyToupdate.save();
//         console.log(companyToupdate);
//         res.send({ message: "company created successfully", status: 200 })

//     }
//     catch (error) {
//         console.log(error)
//     }
// }
const cmpCreate = async (req, res) => {
    try {
        const { cmp_name, cmp_tagline, cmp_owner, jobcatogory, phonenumber, landline, websitelink, zipcode, country, state, city, employess, rec_mno, worktime, cmp_address2, google, twitter, linkdin, esta_date, cmp_email } = req.body;
        console.log(req.body);
        // if (!cmp_name || !cmp_tagline || !cmp_owner || !jobcatogory || !phonenumber || !landline || !websitelink || !zipcode || !country || !state || !city || !employess || !worktime || !cmp_address2 || !google || !twitter || !linkdin || !esta_date || !cmp_email) {
        //     res.status(400).send("all fields are required");
        // }
        console.log("id===>", req.cmp);
        const companyToupdate = await Tbl_rec_signup.findByIdAndUpdate({ _id: req.user._id }, {
            $set: req.body
            // {
            // cmp_name: cmp_name,
            // cmp_owner: cmp_owner,
            // jobcatogory: jobcatogory,
            // landline: landline,
            // websitelink: websitelink,
            // zipcode: zipcode,
            // country: country,
            // state: state,
            // city: city,
            // employess: employess,
            // worktime: worktime,
            // google: google,
            // twitter: twitter,
            // linkdin: linkdin,
            // esta_date: esta_date,
            // cmp_email: cmp_email,
            // rec_mno: rec_mno

            // }
        })
        await companyToupdate.save();
        console.log(companyToupdate);
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
        // const response = await tbl_registration.findById({ _id: req.cmp.id });
        // res.status(200).send({ "data": response });
    }
    catch (error) {
        console.log(error)

    }
}

const checkprofile = async (req, res) => {
    try {
        const id = req.user.id;

        const profile = await Tbl_js_signup.findById({ _id: id })

        if (profile.js_skill != null) {
            res.status(201).send({ status: 11, msg: "Please Fill Up Your All Details in Profile" })
        } else {
            res.status(401).send({ status: 0 })
        }
    } catch (error) {

    }
}
const checkpayment = async (req, res) => {
    try {
        const id = req.user._id;
        const pay = await tbl_payment.findOne({ paymentby: id })
        console.log(`Check p;ayment----->${pay}`)
        const profile = await Tbl_rec_signup.findById({ _id: id })


        if (profile.employess == null) {
            res.send({ status: 1, msg: "Please Fill Your Profile" })
        } else if (pay == null || pay.ispaid == null) {
            res.send({ status: 2, msg: "Please Take Any Subscription For Job post" })
        }
        // else if (profile.employess == null && pay.ispaid == null) {
        //     res.send({ status: 3, msg: "Please Fill Your Profile" })
        // }
        else {
            res.send({ status: 0 })
        }
    } catch (error) {
        console.log(`Error from the check payment ${error}`)
    }
}

// 10/3/2022
const jobpost = async (req, res) => {
    try {
        const data = await tbl_payment.findOne({ paymentby: req.user.id });
        const { jobtitle, gender, designation, salaryrange, vacancy, experience, jobtype, qualification, degree, skill, languageknown, interviewtype, description } = req.body;

        if (jobtitle && gender && designation && salaryrange && vacancy && experience && jobtype && qualification && skill && languageknown && interviewtype && description && degree) {

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
                await newJobPost.save();
                await tbl_payment.findOneAndUpdate({ paymentby: req.user.id }, { $inc: { jobpostcount: 1 } }, { new: true });
                res.send({ status: 200, msg: "Job Post Successfully" })
            }

        } else {
            console.log("All Fileds Are Required!!")
            res.send("All Fileds Are Required!!")
        }


        // const { jobtitle, gender, category, salaryrange, vacancy, experience, jobtype, qualification, skill, languageknown, interviewtype, joblocation, description } = req.body;

        // if (jobtitle && gender && category && salaryrange && vacancy && experience && jobtype && qualification && skill && languageknown && interviewtype && joblocation && description) {
        //     console.log("from the condi")
        //     const newJobPost = await Tbl_jobpost.create({
        //         postedby: req.user._id,
        //         jobtitle: jobtitle,
        //         gender: gender,
        //         category: category,
        //         salaryrange: salaryrange,
        //         vacancy: vacancy,
        //         experience: experience,
        //         jobtype: jobtype,
        //         qualification: qualification,
        //         skill: skill,
        //         languageknown: languageknown,
        //         interviewtype: interviewtype,
        //         joblocation: joblocation,
        //         description: description
        //     });
        //     await newJobPost.save();
        //     res.send({ status: 200, msg: "Job Post Successfully" })
        // } else {
        //     console.log("All Fileds Are Required!!")
        //     res.send("All Fileds Are Required!!")
        // }
    } catch (error) {
        console.log(`Error in Job Post ${error}`)
        res.send(`something wrong`);
    }
}

const getOwnJobpost = async (req, res) => {
    try {
        // console.log(req.cmpid);
        // const recd = 
        // console.log(`Get own job post id :- ${recd}`);

        const response = await Tbl_jobpost.find({ postedby: req.user._id, isDeleted: { $eq: null } })//.sort(created = -1);//.select('-postedby');
        // console.log(response)
        res.send(response);
    } catch (error) {
        console.log(error);
    }
}
//11/3/23
const restorejobPost = async (req, res) => {
    try {
        if (!req.body) {
            res.send('adata not found')
        }
        const jobid = req.params.id;
        console.log(jobid)
        await Tbl_jobpost.findByIdAndUpdate({ _id: jobid }, { $set: { isDeleted: 1 } })
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
        await Tbl_jobpost.findByIdAndUpdate({ _id: jobid }, { $set: { isDeleted: null } })
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
        // console.log(req.cmpid);
        // const recd = 
        // console.log(`Get own job post id :- ${recd}`);

        const response = await Tbl_jobpost.find({ postedby: req.user._id, isDeleted: { $ne: null } })//.sort(created = -1);//.select('-postedby');
        // console.log(response)
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
            // await result.save();
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

        const emailMatch = await Tbl_rec_signup.findOne({ cmp_email: cmp_email })
        console.log(emailMatch)
        if (emailMatch) {
            console.log("find")
            // res.status(201).json({ emailMatch })
            const token = jwt.sign({ _id: emailMatch._id }, process.env.SECRETE_KEY, { expiresIn: "600s" });
            console.log(`tokern ${token}`)

            if (token) {
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: cmp_email,
                    subject: "Testing mail send ",
                    text: `This link valid for 2 min  http://localhost:3000/recruiterforgot/${emailMatch._id}/${token}`
                }

                transporter.sendMail(mailOptions, async (error, info) => {
                    if (error) {
                        console.log("Error", error)
                        await res.status(401).json({ err: "error", status: 401 })

                    } else {
                        console.log(`Email sent :- ${info}`)
                        await res.status(201).json({ info, status: 201 })
                    }
                })
            }
        } else {
            console.log("user not found")
            res.status(401).json({ msg: "not found", status: 401 })
        }
        // const transporter = nodemailer.createTransport({
        //     service: "gmail",
        //     auth: {
        //         user: process.env.EMAIL,
        //         pass: process.env.PASS
        //     }
        // });

        // const mailOptions = {
        //     from: process.env.EMAIL,
        //     to: email,
        //     subject: "Testing mail send ",
        //     html: "<h1>Hlw Success</h1>"
        // }

        // transporter.sendMail(mailOptions, (error, info) => {
        //     if (error) {
        //         console.log("Error", error)
        //     } else {

        //         console.log(`Email sent :- ${info}`)
        //         res.status(201).send({ info, status: 201 })
        //     }
        // })

    } catch (error) {
        console.log(`Error in mail auth :- ${error}`)
        // res.status(401).send({  status: 401 })
    }

    // console.log(req.body)
}

var recruiterforgot = async (req, res) => {
    const { id, token } = req.params
    console.log("start  from the seekerforgot")
    const { cmp_pwd } = req.body
    try {
        const valid = await Tbl_rec_signup.findOne({ _id: id });
        console.log(`valid form the seekerforgot  ${valid}`)
        const verifyToken = jwt.verify(token, process.env.SECRETE_KEY);
        if (valid && verifyToken._id) {
            const newpassword = await bcrypt.hash(cmp_pwd, 12);

            const setNewUserPass = await Tbl_rec_signup.findByIdAndUpdate({ _id: id }, { cmp_pwd: newpassword })
            setNewUserPass.save();
            console.log(`UPdated pass ${setNewUserPass}`)
            res.status(201).send({ status: 201, setNewUserPass })
        } else {
            console.log("not from the seekerforgot")
            res.status(401).send({ status: 401, error: "user no varify" })
        }

    } catch (error) {
        console.log("catch from the seekerforgot")
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
                console.log("pass matched")
                const oldnewmatch = await bcrypt.compare(updatedpass, match.cmp_pwd);
                if (oldnewmatch) {
                    res.status(401).send({ status: 401, err: "New Password & Old Password  Always Diferent" })
                }
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
        // const result = await data.json()
        res.status(201).send(data)
    } catch (error) {
        console.log(`Error from the manageindustry :- ${error}`)
    }
}


const getappliedUser = async (req, res) => {
    try {
        console.log(req.user._id);
        const response = await Tbl_jobapply.find({ rec_id: req.user._id }).populate('js_id');
        // console.log(response)
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
        // console.log(response)
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
        // console.log(response)
        const result = await response.filter((item) => item.accept == 2)
        res.send(result);
    } catch (error) {
        console.log(error);
    }
}


const acceptRequest = async (req, res) => {
    // const jobid = req.body
    const jobid = req.params.id;
    console.log("id---------->", jobid)
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
        console.log(`from auth :-- ${id}`)
        const seekerid = await Tbl_jobapply.findById({ _id: id }, { _id: 1 }).populate('js_id')
        const sekmail = seekerid.js_id.js_email
        // console.log(`bhai khali seeker id joi 6 :---->${sekid}`)

        if (sekmail) {
            const mailOptions = {
                from: process.env.EMAIL,
                to: sekmail,
                subject: "🥳🥳 Your Job Application Accept 🥳🥳",
                text: `We are most happy to appoint as a Developer . Plz Quikly contact our HR for interview`
            }

            transporter.sendMail(mailOptions, async (error, info) => {
                if (error) {
                    console.log("Error", error)
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
    // const jobid = req.body
    const jobid = req.params.id;
    console.log("id---------->", jobid)
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
                    $set: {
                        ratingstar: req.body.ratingstar,
                        review: req.body.review
                    }
                },
                { new: true })
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
        if (data != null) {
            res.status(201).send({ status: 1, data })
        } else {
            res.status(201).send({ status: 2 })
        }
    } catch (error) {

    }
}




// %%%%%%%%%%%%%%%%%%%%%%%%%   SEARCH JOB   %%%%%%%%%%%%%%%%%%%%%%%%%

var jobtype = async (req, res) => {
    try {
        const jobtype = req.body.jobtype
        if (!jobtype) {
            res.status(401).send({ error: "All Field Required", status: 400 })
        } else {
            const job = await Tbl_jobpost.find({ "jobtype": { $in: [jobtype] } })
            console.log(job)
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

            if (job == "") {

                res.status(401).send({ error: "Job Not Available on This Place", status: 401 })
            } else {
                res.status(201).send({ job, status: 201 })
            }
        } else {
            res.status(401).send({ error: "All Field Required", status: 401 })
        }
    } catch (error) {
        res.status(401).send({ error: `Error from the jobtype ==> ${error} ` })
    }
}

var exportcsv = async (req, res) => {
    try {
        const result = await Tbl_jobapply.find({ accept: 1 }).populate("js_id");


        const csvStream = csv.format({ headers: true })

        if (!fs.existsSync("public/files/export")) {
            if (!fs.existsSync("public/files")) {
                fs.mkdirSync("./public/files/")
            }

            if (!fs.existsSync("public/files/export")) {
                fs.mkdirSync("./public/files/export")
            }
        }

        const writablestream = fs.createWriteStream(
            "public/files/export/user.csv"
        )

        csvStream.pipe(writablestream)

        writablestream.on("finish", function () {
            res.json({
                downloadurl: `http://localhost:5000/files/export/user.csv`
            })
        })

        if (result.length > 0) {
            result.map((user) => {
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
        res.status(400).send({ err: `something is error =>>${error}` })
    }
}


const KEY_ID = 'rzp_test_9nfVtZEUhhp81B'
const KEY_SECRET = 'OXQ23W2FwNdJ7N1bA936dvKr'

const order = (req, res) => {
    var instance = new Razorpay({
        key_id: KEY_ID,
        key_secret: KEY_SECRET,
    });

    console.log("amount--->", req.body)
    console.log("amount--->", req.body.amount * 100)

    var options = {
        amount: req.body.amount * 100,  // amount in the smallest currency unit
        currency: "INR",
        // packagename: req.body.packagename
        // receipt: "order_rcptid_11"
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
        var expectedSignature = crypto.createHmac("sha256", KEY_SECRET).update(body.toString()).digest('hex');

        if (expectedSignature === req.body.razorpay_signature) {
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
        else {
            res.send({ message: "payment failed", status: 400 })
        }

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
        // const data = await Tbl_jobapply.find({ accept: 1 }).populate("js_id");
        res.status(201).send(data)
    } catch (error) {
        console.log(`Error from the Recruiterlist :- ${error}`)
    }
}

var seeklist = async (req, res) => {
    try {
        const data = await Tbl_js_signup.find({});
        // const data = await Tbl_jobapply.find({ accept: 1 }).populate("js_id");
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
        // const data = await Tbl_jobapply.find({ accept: 1 }).populate("js_id");
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
    // try {
    //     let token;
    //     const { adotp } = req.body;
    //     if (adotp) {
    //         const user = await adminotp.findOne({ otp: adotp });
    //         console.log(user)
    //         if (user != null) {
    //             // const passMatch = await bcrypt.compare(adminpwd, user.adminpwd);
    //             if (otp === user.otp) {
    //                 //  && passMatch) {

    //                 const token = jwt.sign({ id: user._id }, process.env.SECRETE_KEY)

    //                 res.json({ status: 201, msg: "OPT Send on Your Email", tok: token });
    //             } else {
    //                 return res.json({ status: 400, err: "Invalid Credential" })
    //             }
    //         } else {
    //             return res.json({ status: 400, err: "Admin not Available" })
    //         }
    //     } else {
    //         return res.json({ status: 400, err: "All fields required" })
    //     }
    // } catch (er) {
    //     console.log(`Error ${er}`);
    // }
}

var addindustry = async (req, res) => {
    try {
        const { ind_name } = req.body;
        if (ind_name) {
            const match = await Tbl_industry.findOne({ ind_name });
            if (match) {
                res.send("Industry Already Available");
            }
            console.log("body===>", ind_name)
            // const type = new Tbl_industry({ ind_name })
            const data = await Tbl_industry.create({ ind_name: req.body.ind_name })
            // const result = data.json();
            if (data) {
                res.send({ status: 200, msg: "Industry Added Successful" })
            } else {
                res.send({ status: 400, error: "Industry Not Added" })
            }
        } else {
            res.send({ status: 400, error: "All Fields Required" })
        }
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
    // console.log(process.env.EMAIL)
    const { adminemail } = req.body
    console.log(adminemail)
    if (!adminemail) {
        res.status(400).send({ error: "Please Enter Your Email" });
    }

    try {
        const preuser = await Tbl_admin.findOne({ adminemail: req.body.adminemail });
        console.log(`preuser->${preuser}`)
        if (preuser) {
            const OTP = Math.floor(100000 + Math.random() * 900000)
            console.log(`otp==> ${OTP}`)
            const existEmail = await Otp.findOne({ adminemail: adminemail })
            console.log(`exist user==> ${existEmail}`);
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
                // console.log(`new =>>>${saveOtpData}`)

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
                $set: {
                    isBlock: 1
                }
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
                $set: {
                    isBlock: 1
                }
            }, { new: true })
        await block.save()
        console.log("this Recruiter Blocked")
        res.status(201).send({ status: 201, msg: "this Recruiter Blocked" })
    } catch (error) {
        console.log(`Error from the seeker block ${error}`)
    }
}

var getseekerreviewall = async (req, res) => {
    try {

        const data = await Tbl_js_review.find().populate('seeker_id')
        res.status(201).send(data)
    } catch (error) {

    }
}
var getrecruiterreviewall = async (req, res) => {
    try {

        const data = await Tbl_rec_review.find().populate('recruiter_id')
        res.status(201).send(data)
    } catch (error) {

    }
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
    // const newobj = req.body
    pdf.create(pdfTemplate(req.body), {}).toFile('rezultati.pdf', (err) => {
        if (err) {
            return console.log('error');
        }
        res.send(Promise.resolve())
    });
}

const downloadResume = () => {
    res.sendFile(`${__dirname}/rezultati.pdf`);
}

const createPaymentReceipt = () => {
    const paymentdata = tbl_payment.find({ paymentby: req.user._id })
    console.log("data---->", data)
    pdf.create(PaymentReceiptTemplate(paymentdata), {}).toFile('rezultati.pdf', (err) => {
        if (err) {
            return console.log('error');
        }
        res.send(Promise.resolve())
    });
}

const downloadPaymentReceipt = () => {
    res.sendFile(`${__dirname}/rezultati.pdf`);
}


module.exports = {
    // resumepost,
    router,
    signup, signin, cmpupdatelogo, seekercontact,
    getseeker, updateprofile, updateimage,
    cmpRegistration, cmpLogin, reccontact,
    cmpCreate, getrecruiter,
    js_contact, get_contact,
    getjobpost, recruiterlist,
    applyjob, jobpost,
    getOwnJobpost, deletejobPost,
    getperticularJob, updatejob,
    Changepassword, mail,
    seekerforgot, getseekerforgot, jobbackup,
    jobhistory, jobapplyrestore,
    restorejob, seekerapplydel,
    recmail, recruiterforgot,
    recchangepassword, manageindustry,
    seekerlist, seekerlistdel,
    recruiterlistdel, rejectRequest,
    acceptRequest, RejectUserList,
    AcceptUserList, getappliedUser,
    acceptmail, sendmsg, jobdetail, getjobedu, trashgetOwnJobpost, restorejobPost,
    updaterestorejobpost, seekerreview, getseekerreview, recruiterreview,
    getrecruiterreview, getseekerreviewall, getrecruiterreviewall, checkpayment, checkprofile,
    download, downloadResume, recdeleteaccount, sekdeleteaccount, seeklist, reclist,
    createPaymentReceipt, downloadPaymentReceipt,
    // job searh
    jobtype, location, jobs, exportcsv, order, verify, signingoogle, getseekercon, jobhistoryaccept, jobhistoryreject,

    homeviewindustry, totalrecruiterlist, totalseekerlist, payment,


    // Admin Side
    adsignup,
    adSignin, addindustry, recruiterdata, sendotp, getseekercon, viewindustry, seekerblock, recruiterblock, seekercon, recruitercon,
    // back up & restore
    seekerbackup,
} 