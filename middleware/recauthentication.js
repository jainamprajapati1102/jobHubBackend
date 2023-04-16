const jwt = require("jsonwebtoken")
const Tbl_rec_signup = require('../models/recSignupSchema');
const cookie = require("cookie-parser")



const authentication = async (req, res, next) => {
    let token;
    const { authorization } = req.headers;
    console.log("authorized=====>", authorization)
    if (authorization && authorization.startsWith('Bearer')) {
        try {
            // Get Token From header
            token = authorization.split(' ')[1];
            console.log("token  undder======>", token)//Verify Token
            const res = jwt.verify(token, process.env.SECRETE_KEY);
            let userID = " ";
            console.log(res);
            if (res.error) {
                throw new error("User Is Not verified !!")
            } else {
                userID = res.cmpid
            }
            console.log("Recruiter ID====>", userID)
            //Get user from Token
            req.user = await Tbl_rec_signup.findById(userID).select('-rec_pwd');
            // req.user=
            next();

        } catch (error) {
            console.log(error);
            res.status(400).json({ message: 'Unauthorized User ' })
        }
    }
    if (!token) {
        res.status(400).json({ message: 'Unauthorized user,no Token' })
    }
}

module.exports = authentication