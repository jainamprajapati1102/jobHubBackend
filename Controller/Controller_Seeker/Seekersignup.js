const express = require("express");
const app = express();
const router = express.Router();
router.use(express.json());
const bcrypt = require("bcrypt");  // for pass hashing 
const jwt = require('jsonwebtoken');
const Tbl_js_signup = require("../../models/signupSchema"); // schema for the user rigister
const Counter = require("../../models/counter"); // schema for the user rigister
const nodemailer = require('nodemailer')
const axios = require('axios')
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
                    Counter.findOneAndUpdate(
                        { id: "autoval" },
                        { "$inc": { "seq": 1 } },
                        { new: true }, (err, cd) => {
                            // console.log("counter :- ", JSON.stringify(cd));
                            let seqId;
                            if (cd == null) {
                                const newVal = new Counter({ id: "autoval", seq: 1 });
                                newVal.save();
                                seqId = 1;
                            } else {
                                seqId = cd.seq;
                                let abc = "js" + seqId;
                                const veri = async () => {
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
                                    // console.log(data);
                                    if (data) {
                                        const transporter = nodemailer.createTransport({
                                            service: "gmail",
                                            auth: {
                                                user: process.env.EMAIL,
                                                pass: process.env.PASS
                                            }
                                        });

                                        const mailOptions = {
                                            from: process.env.EMAIL,
                                            to: js_email,
                                            subject: "Thank You For Signup in Job's Hub",
                                            html: `<p>Here is your <strong>username</strong> and <strong>password</strong>:</p>
                                                                                <p><strong>Username:</strong>   ${js_email}
                                                                                <p><strong>Password:</strong> ${js_pwd}</p>`
                                        }

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
                                                                  Username:   ${js_email}
                                                                  Password: ${js_pwd}  \n PLEASE DO NOT SHARE WITH ANYONE `),
                                                    media: "[]",
                                                    delay: "0",
                                                    schedule: "",
                                                    numbers: `${js_mno}`
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
                                        res.status(200).send({ status: 200, data: data, msg: " Inserted successfully..." });
                                    }
                                }
                                veri();
                            }
                        }
                    )
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

module.exports = { signup }