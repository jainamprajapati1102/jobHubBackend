const express = require('express')
const app = express()
const cors = require("cors");
const path = require("path")
app.use(express.json());
const option = { origin: "*" };
app.use(cors(option));
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
// const bcrypt = require("bcrypt");
const port = process.env.PORT || 5000;
require("../server/db/conn");
const routs = require("../server/rotute/auth")
app.use('/public', express.static('public'))
app.use('/files', express.static('./public/files'))
const cookieSession = require("cookie-session")
const seekersignup = require('./Controller/Controller_Seeker/Seekersignup');

var GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require("passport")
const pdf = require('html-pdf')
const pdfTemplate = require('./documentjs/document')
// const PaymentReceiptTemplate = require('../')
require("../server/models/googleUserSchema")
app.use(
    cookieSession({
        maxAge: 30 * 24 * 60 * 60 * 1000,
        keys: [process.env.cookieKey]
    })
)
app.use(passport.initialize());
app.use(passport.session());


app.get('/resume', (req, res) => {
    res.render('resume.ejs')
})

require("./rotute/passport")


// for google configuration
app.get(routs.signingoogle(app));

app.get('/current_user', (req, res) => {
    res.send(res.user)
})

app.get('/api/logout', (req, res) => {
    req.logout();
    res.send(req.user)
})






// middleware
const jsauthenticate = require("./middleware/authentication");
const recauthenticate = require("./middleware/recauthentication");
const upload = require('./middleware/fileupload')
const seekerimage = require("./middleware/seekerprofile");
const resume = require("./middleware/resumeupload");

// view industry on lending page 
app.get('/homeviewindustry', routs.homeviewindustry);



// Pdf Manage

//$$$$$$$$$$$$$$ Seeker API for CRUD operation $$$$$$$$$$$$$$

app.post('/createResume', (req, res) => {
    try {
        const users = req.body
        pdf.create(pdfTemplate(req.body), {}).toFile('rezultati.pdf', (err) => {
            if (err) {
                return console.log('error', err);
            }
            res.send(Promise.resolve())
        })
    } catch (error) {
        console.log(`Error from the create Resume ==>${error}`)
    }

})
app.get('/downloadresume', (req, res) => {
    try {
        res.sendFile(`${__dirname}/rezultati.pdf`);
    } catch (error) {
        console.log(`Error from the Download Resume ==>${error}`)
    }
})


// app.post('/createreceipt', (req, res) => {
//     try {
//         const paymentdata = tbl_payment.find({ paymentby: req.user._id })
//         console.log("data---->", data)
//         pdf.create(PaymentReceiptTemplate(paymentdata), {}).toFile('rezultati.pdf', (err) => {
//             if (err) {
//                 return console.log('error');
//             }
//             res.send(Promise.resolve())
//         });
//     } catch (error) {
//         console.log(`Error from the create Resume ==>${error}`)
//     }

// })
// app.get('/downloadreceipt', (req, res) => {
//     try {
//         res.sendFile(`${__dirname}/rezultati.pdf`);
//     } catch (error) {
//         console.log(`Error from the Download receipt ==>${error}`)
//     }
// })
app.post('/createreceipt', recauthenticate, routs.createPaymentReceipt)
app.get('/downloadreceipt', routs.downloadPaymentReceipt)
// app.get("/resumepdf", jsauthenticate, routs.pdfexport); /// api for pdf generator

app.post('/signup', seekersignup.signup) // Seeker Signup Api
app.post('/login', routs.signin) // Seeker Sign Api
app.put('/updateprofile', jsauthenticate, routs.updateprofile)  // Seeker Update Profile Api
app.put('/seekerreview', jsauthenticate, routs.seekerreview)  // Seeker Update Profile Api
app.get('/getseekerreview', jsauthenticate, routs.getseekerreview)  // Seeker Update Profile Api

app.get("/getseeker", jsauthenticate, routs.getseeker)  // Get Seeker Api
app.get("/getseekercon", routs.getseekercon)  // Get Seeker Api

app.post("/contact", jsauthenticate, routs.js_contact); // Seeker Contact Api
app.post("/seekercontact", jsauthenticate, routs.seekercontact); // Seeker Contact Api

app.post("/getcont", routs.get_contact) // Seeker Get Contact  Api

app.post("/mail", routs.mail) // sending mail


// ****** Forgot Password ******


app.get("/seekerforgot/:id/:token", routs.getseekerforgot) //  Get seeker detail on id & token 
app.post("/seekerforgot/:id/:token", routs.seekerforgot) // Seeker Forgot Password 

app.post("/applyjob/:id", jsauthenticate, resume, routs.applyjob) // Seeker Job Apply Api
app.post("/applyjob", jsauthenticate, resume, routs.applyjob) // Seeker Job Apply Api
app.get("/jobdetail/:id", jsauthenticate, routs.getperticularJob) // Seeker Job Apply Api

app.get('/getjobpost', jsauthenticate, routs.getjobpost) // Seeker Get Job Post   Api
app.get('/getjobedu', jsauthenticate, routs.getjobedu) // Seeker Get Job Post   Api

app.post('/changepass', jsauthenticate, routs.Changepassword) // Seeker Password Change  Api

app.get('/jobhistory', jsauthenticate, routs.jobhistory) //  Get Seeker Applied Job Data  who's pending
app.get('/jobhistoryreject', jsauthenticate, routs.jobhistoryreject) //  Get Seeker Applied Job Data who's reject
app.get('/jobhistoryaccept', jsauthenticate, routs.jobhistoryaccept) //  Get Seeker Applied Job Data who's accept 

app.patch('/jobbackup/:id', jsauthenticate, routs.jobbackup) //  Backup Seeker Applied Job Data 
app.put('/jobapplyrestore/:id', jsauthenticate, routs.jobapplyrestore) //  Backup Seeker Applied Job Data 

app.get('/jobrestore', jsauthenticate, routs.restorejob)  // seeker job restore

app.delete('/seekerapplydel/:id', jsauthenticate, routs.seekerapplydel)  // seeker job Delete

app.post('/acceptmail/:id', routs.acceptmail)  // Accept mail send on seeker email id 

app.post('/sendmsg', routs.sendmsg);

app.put('/updateimage', jsauthenticate, seekerimage, routs.updateimage);


app.delete('/sekdeleteaccount', jsauthenticate, routs.sekdeleteaccount); // Seeker Account Delete

app.get('/checkprofile', jsauthenticate, routs.checkprofile)

// JOB SEARCH
app.get('/jobtype', jsauthenticate, routs.jobtype)
app.get('/location', jsauthenticate, routs.location)



//$$$$$$$$$$$$$$ Recruiter API for CRUD operation $$$$$$$$$$$$$$
app.post('/recsignup', upload, routs.cmpRegistration); // Recruiter signup

app.post('/reclogin', routs.cmpLogin); // Recruiter signin

app.put('/createcmp', recauthenticate, routs.cmpCreate); // Recruiter Profile Update
app.delete('/recdeleteaccount', recauthenticate, routs.recdeleteaccount); // Recruiter Account Delete 


app.post('/jobpost', recauthenticate, routs.jobpost); // Recruiter Add job 

app.get('/getrecruiter', recauthenticate, routs.getrecruiter);  // Get Perticular Recruiter using token 

app.get('/getownjobpost', recauthenticate, routs.getOwnJobpost); // Get Perticular Recruiter Posted job

app.get('/trashgetOwnJobpost', recauthenticate, routs.trashgetOwnJobpost); // Get Perticular Recruiter Posted job

app.delete('/deletejobPost/:id', routs.deletejobPost); // Delete added job using id

app.put('/restorejobpost/:id', routs.restorejobPost); // Delete added job using id

app.put('/updatejob/:id', routs.updatejob); // Updated  job using id

app.get('/getperticularjob/:id', routs.getperticularJob); // 

app.put('/cmpupdatelogo', recauthenticate, upload, routs.cmpupdatelogo)
// Passowrd Forgot 
app.post("/recmail", routs.recmail);

app.post("/recruiterforgot/:id/:token", routs.recruiterforgot);

// ChangePassword 
app.post('/recchangepass', recauthenticate, routs.recchangepassword);

app.get('/industry', routs.manageindustry);

app.get('/getapplieduser', recauthenticate, routs.getappliedUser)

app.put('/acceptrequest/:id', recauthenticate, routs.acceptRequest);

app.put('/rejectrequest/:id', recauthenticate, routs.rejectRequest);

app.get('/acceptlist', recauthenticate, routs.AcceptUserList);

app.get('/rejectlist', recauthenticate, routs.RejectUserList)

app.get('/exportcsv', routs.exportcsv)

app.post('/order', routs.order)

app.post('/verify', recauthenticate, routs.verify)
app.post('/reccontact', recauthenticate, routs.reccontact)

app.put('/recruiterreview', recauthenticate, routs.recruiterreview)  // Seeker Update Profile Api


app.put('/updaterestorejobpost/:id', recauthenticate, routs.updaterestorejobpost)  // Seeker Update Profile Api

app.get('/getrecruiterreview', recauthenticate, routs.getrecruiterreview)  // Seeker Update Profile Api
app.get('/checkpayment', recauthenticate, routs.checkpayment)  // Seeker Update Profile Api




//$$$$$$$$$$$$$$$$$  ADMIN SIDE API  $$$$$$$$$$$$$$$$$
app.get('/recruiterlist', routs.recruiterlist);
app.get('/seekerlist', routs.seekerlist);
app.get('/reclist', routs.reclist);
app.get('/seeklist', routs.seeklist);
app.get('/totalseekerlist', routs.totalseekerlist);
app.get('/totalrecruiterlist', routs.totalrecruiterlist);
app.delete('/recruiterlistdel/:id', routs.recruiterlistdel);
app.delete('/seekerlistdel/:id', routs.seekerlistdel);

app.post('/adsignin', routs.adSignin);
app.post('/addindustry', routs.addindustry);

app.get('/recruiterdata', routs.recruiterdata);
app.get('/getseekercon', routs.getseekercon);
app.post('/sendotp', routs.sendotp);

app.get('/viewindustry', routs.viewindustry)
app.post('/sendotp', routs.sendotp);
app.put('/seekerblock/:id', routs.seekerblock);
app.put('/recruiterblock/:id', routs.recruiterblock);

app.get('/getseekerreviewall', routs.getseekerreviewall)
app.get('/getrecruiterreviewall', routs.getrecruiterreviewall)
app.get('/payment', routs.payment)
app.get('/recruitercon', routs.recruitercon)
app.get('/seekercon', routs.seekercon)

// %%%%%%%%%%%%%%% Only For Showing Perpose %%%%%%%%%%%%%%%

app.get('/api/jobs', jsauthenticate, routs.jobs)

// %%%%%%%%%%%%%%% Back up  & Restore %%%%%%%%%%%%%%%
app.get('/seekerbackup', routs.seekerbackup)


app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`App listening on port ${port}!`))