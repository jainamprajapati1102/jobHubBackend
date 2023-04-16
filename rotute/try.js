var insert = (req, res) => {
    try {
        sql = `Select * from registration where jsemail = '${req.body.jsemail}'`;
        con.query(sql, (error, result) => {
            console.log(error, "err")
            console.log(result, "res")

            if (error) {
                console.log(error);
            } else {
                if (result.length > 0) {
                    res.send({ status: 0, msg: "E-mail  already Used....." })
                } else {

                    const insertUser = `insert into registration (jsname,jslname,jsemail,jspwd,jsmno) values('${req.body.jsname}','${req.body.jslname}','${req.body.jsemail}','${req.body.jspwd}','${req.body.jsmno}')`;

                    con.query(insertUser, (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                            if (result.affectedRows > 0) {

                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    if (result.affectedRows > 0) {
                                        let transport = nodeMailer.createTransport({
                                            service: "gmail",
                                            auth: {
                                                user: "demo76355@gmail.com",
                                                pass: "sbyunklobvnfyoff",
                                            }
                                        })

                                        let mailOptions = {
                                            from: "demo76355@gmail.com",
                                            to: req.body.jsemail,
                                            subject: "Job's Hub",
                                            html: `<p>Here is your <strong>username</strong> and <strong>password</strong>:</p>
                                                            <p><strong>Username:</strong>   ${req.body.jsemail}
                                                            <p><strong>Password:</strong> ${req.body.jspwd}</p>`

                                        }
                                        transport.sendMail(mailOptions, (err, info) => {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                console.log(info, "info");
                                                const data = {
                                                    message: JSON.stringify(`Thank You For Registration in Job's Hub.\n Here Is your Username And Password :
                                                                  Username:   ${req.body.jsemail}
                                                                  Password: ${req.body.jspwd}  \n PLEASE DO NOT SHARE WITH ANYONE `),
                                                    media: "[]",
                                                    delay: "0",
                                                    schedule: "",
                                                    numbers: `${req.body.jsmno}`
                                                };
                                                try {
                                                    const response1 = axios.post('http://api.wapmonkey.com/send-message', data, {
                                                        headers: {
                                                            Authorization: "U2FsdGVkX19VqOirKkYXtA8g8M2Jddh/pCl89RgMK54="
                                                        }
                                                    });

                                                } catch (error) {
                                                    console.error(error);
                                                    throw new Error('Failed to send message');
                                                }
                                            }
                                        })
                                    }
                                }

                                res.send({ status: 1, result: result, msg: "Registration  Successfully..." })

                            }
                        }
                    })
                }
            }
        })
    } catch (error) {
        console.log(error);
        res.send({ status: 0, response1, msg: "Failed to insert user" });

    }
}