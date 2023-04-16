const jwt = require("jsonwebtoken")
const Tbl_js_signup = require('../models/signupSchema');
const cookie = require("cookie-parser")



const authentication = async (req, res, next) => {
    let token;
    const { authorization } = req.headers;
    // console.log("authorized=====>", authorization)

    if (authorization && authorization.startsWith('Bearer')) {
        try {
            // Get Token From header
            token = authorization.split(' ')[1];
            // console.log("token ======>", token)//Verify Token
            const res = jwt.verify(token, process.env.SECRETE_KEY);
            let userID = " ";

            if (res.error) {
                throw new error("zfsdfdsf")
            } else {
                userID = res.id
            }
            console.log("userid====>", userID)
            //Get user from Token
            req.user = await Tbl_js_signup.findById(userID).select('-js_pwd');

            next()

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