var GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require("mongoose");
const passport = require("passport")
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
var session = require('express-session')
const User = require("../models/googleUserSchema")
const Tbl_js_signup = require("../models/signupSchema")

passport.use(new GoogleStrategy(
    {
        clientID: process.env.googleClientID,
        clientSecret: process.env.googleClientSecrete,
        callbackURL: "/auth/google/callback"
    }, (accessToken, refreshToken, profile, done) => {
        // User.findOrCreate({ googleId: profile.id }, function (err, user) {
        //     return done(err, user);
        // });
        Tbl_js_signup.findOne({ googleId: profile.id })
            .then((exsituser) => {
                if (exsituser) {
                    return done(null, exsituser)
                } else {
                    new Tbl_js_signup({
                        "googleId": profile.id,
                        "js_name": profile.name.givenName,
                        "js_email": profile._json.email,
                        "js_profile": profile._json.picture,
                    }).save()
                        .then((user) => {
                            return done(null, user)
                        })
                    console.log("thay gayu")
                }
            })
        console.log(`Profile name ==>>${JSON.stringify(profile)}`)
        console.log(`Profile name ==>>${JSON.stringify(profile.name.givenName)}`)
        console.log(`Profile email==>>${JSON.stringify(profile._json.email)}`)
        console.log(`Profile picture==>>${JSON.stringify(profile._json.picture)}`)

    }
));
// passport.use(new GoogleStrategy({
//     clientID: process.env.googleClientID,
//     clientSecret: process.env.googleClientSecrete,
//     callbackURL: "/auth/google/callback"
// },
//     async (accessToken, refreshToken, profile, done) => {
//         const existuser = await Tbl_js_signup.findOne({ googleId: profile.id });
//         if (existuser) {
//             console.log("Exist id ===>" + existuser._id)
//             console.log("Toekn ===>" + accessToken)
//             // console.log("refresh Toekn ===>" + refreshToken)
//             return done(null, existuser)
//         } else {
//             const newuser = await Tbl_js_signup.create({
//                 "googleId": profile.id,
//                 "js_name": profile.name.givenName,
//                 "js_email": profile._json.email,
//                 "js_profile": profile._json.picture,
//             })
//             console.log(`Profile name ==>>${JSON.stringify(profile)} `)
//             console.log(`Profile name ==>>${JSON.stringify(profile.name.givenName)}`)
//             console.log(`Profile email==>>${JSON.stringify(profile._json.email)}`)
//             console.log(`Profile picture==>>${JSON.stringify(profile._json.picture)}`)
//             // res.status(200).send({ status: 200, newuser })
//             callback(null, newuser);
//         }
//     }
// ))

passport.serializeUser(async (user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    const user = await Tbl_js_signup.findOne(id)
    await done(null, user)
})