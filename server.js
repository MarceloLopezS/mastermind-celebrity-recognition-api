import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import db from './database/db.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const app = express();

app.use(cors());
app.use(express.json());

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const errors = {}; // Errors -> key = Input html id, value = Message
    if (!email) {
        errors["user-email"] = "Please enter your email";
    } else {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (!email.match(emailRegex)) {
            errors["user-email"] = "Please enter a valid email";
        }
    }
    if (!password) {
        errors["user-password"] = "Please enter your password";
    }

    if(Object.keys(errors).length > 0) {
        res.status(400).json({
            status: "user-errors",
            errors
        });
    } else {
        const authUser = async () => {
            const selectAuth = "SELECT * FROM auth WHERE email = $1";
            const authValues = [email];
            try {
                const selectAuthResponse = await db.query(selectAuth, authValues);
                if (selectAuthResponse.rowCount === 0) {
                    errors[loginMessage] = "Incorrect email or password.";
                    return res.status(400).json({
                        status: "fail",
                        errors
                    });
                }
                
                const userAuthRow = selectAuthResponse.rows[0];
                if (userAuthRow.activation !== 'active') {
                    errors[loginMessage] = "This account is not yet activated."
                    return res.status(400).json({
                        status: "fail",
                        errors
                    });
                }

                const hashMatch = await bcrypt.compare(password, userAuthRow.hash);
                if (!hashMatch) {
                    errors[loginMessage] = "Incorrect email or password.";
                    return res.status(400).json({
                        status: "fail",
                        errors
                    });
                }

                return res.json({
                    status: "success"
                });
                // Create a user ID cookie.
                // Redirect to /face-detection
            } catch (err) {
                console.log(err);
                errors[loginMessage] = "There was an error in the login process. Please try again later.";
                return res.status(502).json({
                    status: "fail",
                    errors
                });
            }
        }

        authUser();
    }
})

app.post('/register', (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    const errors = {}; // Errors -> key = Input html id, value = Message
    if (!name) {
        errors["user-name"] = "Please enter your name";
    }
    if (!email) {
        errors["user-email"] = "Please enter your email";
    } else {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (!email.match(emailRegex)) {
            errors["user-email"] = "Please enter a valid email";
        }
    }
    if (!password) {
        errors["user-password"] = "Please enter a password";
    } else if ( password.split("").length < 8) {
        errors["user-password"] = "Password must have at least 8 characters";
    }
    if (!confirmPassword) {
        errors["user-confirm-password"] = "Please confirm your password";
    } else {
        if (!(password === confirmPassword)) {
            errors["user-password"] = "Passwords don't match";
            errors["user-confirm-password"] = "Passwords don't match";
        }
    }

    if(Object.keys(errors).length > 0) {
        res.status(400).json({
            status: "user-errors",
            errors
        });
    } else {
        const sendVerificationEmail = async (verificationToken) => {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            })
            const mailOptions = {
                from: '"Mastermind" <m4rck4n24@gmail.com>',
                to: email,
                subject: 'Verify you Mastermind account',
                html: `
                    <html>
                    <head>
                        <style>
                            h1 {
                                color: #00abb8;
                            }
                            a {
                                color: #ffc342;
                            }
                            a::hover, a:active {
                                color: #f6b831;
                            }
                        </style>
                    </head>
                    <body>
                        <h1>Hello! Please verify your Mastermind account:</h1>
                        <p>In order to be able to log in and use face detection on images through our app, you need to verify your account.</p>
                        <p>
                            Please click in the following link or copy and paste it into your browser: 
                        </p>
                        <p>
                            <a href="http://localhost:3001/email-verification/${verificationToken}">
                                http://localhost:3001/email-verification/${verificationToken}
                            </a>
                        </p>
                    </body>
                    <html>
                `
            }
            const mailInfo = await transporter.sendMail(mailOptions);

            return mailInfo;
        }

        const registerUser = async () => {
            const saltRounds = 10;
            const hash = await bcrypt.hash(password, saltRounds);
            try {
                const selectUser = "SELECT $1 FROM users WHERE email = $2";
                const selectUserValues = ['activation', email];

                const selectUserResponse = await db.query(selectUser, selectUserValues);
                if (selectUserResponse.rowCount > 0) {
                    errors[registerMessage] = "This email is already registered.";
                    return res.status(400).json({
                        status: "fail",
                        errors
                    });
                }

                const verificationToken = jwt.sign({ email }, process.env.TOKEN_VERIFICATION_SECRET, { expiresIn: '1h' });
                const insertUser = "INSERT INTO users (name, email, joined) VALUES ($1, $2, $3);";
                const insertUserValues = [name, email, new Date()];
                const insertAuth = "INSERT INTO auth (email, hash, activation) VALUES ($1, $2, $3);"
                const insertAuthValues = [email, hash, verificationToken];
                
                const insertUserResponse = await db.query(insertUser, insertUserValues);
                const insertAuthResponse = await db.query(insertAuth, insertAuthValues);
                if (insertUserResponse.rowCount > 0 && insertAuthResponse.rowCount > 0) {
                    const mailInfo = await sendVerificationEmail(verificationToken);
                    if (mailInfo.accepted.length === 0) {
                        errors[registerMessage] = "We couldn't send you a verification email. Please try again later."
                        const deleteUser = "DELETE FROM users WHERE email = $1";
                        const deleteAuth = "DELETE FROM auth WHERE email = $1";
                        const deleteValues = [email];

                        await db.query(deleteUser, deleteValues);
                        await db.query(deleteAuth, deleteValues);
                        return res.status(502).json({
                            status: "fail",
                            errors
                        });
                    }
                    
                    return res.json({
                        status: "success"
                    });
                    // Redirect to email verification needed - Front end
                }
            } catch (err) {
                console.log(err);
                errors[registerMessage] = "There was an error in the registration process. Please try again later.";
                res.status(502).json({
                    status: "fail",
                    errors
                });
            }
        }

        registerUser();
    }
})

app.get('/email-verification/:verificationToken', (req, res) => {
    const verificationToken = req.params.verificationToken;
    jwt.verify(verificationToken, process.env.TOKEN_VERIFICATION_SECRET, (err, decoded) => {
        if (err) {
            return res.redirect(302, "http://localhost:3000/email-verification/error/invalid-token");
        } else {
            const activateUser = async () => {
                const email = decoded.email;
                const selectAuth = "SELECT $1 FROM auth WHERE email = $2";
                const selectAuthValues = ['activation', email];
                try {
                    const selectAuthResponse = await db.query(selectAuth, selectAuthValues);
                    if (selectAuthResponse.rowCount === 0) {
                        throw Error("Email not found.");
                    }

                    if (selectAuthResponse.rows[0].activation === 'active') {
                        return res.redirect(302, "http://localhost:3000/email-verification/activation-success");
                    }

                    const updateAuth = "UPDATE auth SET activation = $1 WHERE email = $2";
                    const updateAuthValues = ['active', email];

                    const updateAuthResponse = await db.query(updateAuth, updateAuthValues);
                    if (updateAuthResponse.rowCount === 0) {
                        throw Error("Failed to update database.")
                    }

                    return res.redirect(302, "http://localhost:3000/email-verification/activation-success");
                } catch (err) {
                    console.log(err);
                    return res.redirect(302, "http://localhost:3000/error");
                }
            }

            activateUser();
        }
    });
})

app.get('/face-detection', (req, res) => {
    // Once a user ID cookie is created, respond with the user's data.
})

app.put('/face-detection/image-entry', (req, res) => {
    // Use the user ID's cookie to edit it's faceEntries when one image is submited. Then send a response with the updated entries.
})

app.listen(process.env.PORT || 3001, () => {
    console.log(`Listening to port ${process.env.PORT || 3001}`);
})