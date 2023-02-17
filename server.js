import express from 'express';
import bcrypt from 'bcrypt';
import db from './database/db.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const app = express();

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
        res.status(400).json(errors);
    } else {
        const authUser = async () => {
            const selectAuth = "SELECT * FROM auth WHERE email = $1";
            const authValues = [email];
            try {
                const selectAuthResponse = await db.query(selectAuth, authValues);
                if (selectAuthResponse.rowCount === 0) {
                    errors['login-message'] = "Incorrect email or password";
                    res.status(400).json(errors);
                } else if (selectAuthResponse.rowCount > 0) {
                    const userAuthRow = selectAuthResponse.rows[0];
                    const hashMatch = await bcrypt.compare(password, userAuthRow.hash);
                    if (!hashMatch) {
                        errors["login-message"] = "Incorrect email or password.";
                        res.status(400).json(errors);
                    } else {
                        res.send("success");
                        // Create a user ID cookie.
                        // Redirect to /face-detection
                    }
                }
            } catch (err) {
                console.log(err);
                errors['login-message'] = "There was an error in the login process. Please try again later.";
                res.status(502).json({errors});
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
        errors["user-password"] = "Please enter your password";
    } else if ( password.length < 8) {
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
        res.status(400).json(errors);
    } else {
        const registerUser = async () => {
            const saltRounds = 10;
            const hash = await bcrypt.hash(password, saltRounds);
            const verificationToken = jwt.sign({ email }, process.env.TOKEN_VERIFICATION_SECRET, { expiresIn: '1h' });
            try {
                const selectUser = "SELECT * FROM users WHERE email = $1";
                const userValues = [email];

                const selectUserResponse = await db.query(selectUser, userValues);
                if (selectUserResponse.rowCount > 0) {
                    errors['register-message'] = "This email is already registered.";
                    res.status(400).json({errors})
                } else {
                    const insertUser = "INSERT INTO users (name, email, joined) VALUES ($1, $2, $3);";
                    const userValues = [name, email, new Date()];
                    const insertAuth = "INSERT INTO auth (email, hash, activation) VALUES ($1, $2, $3);"
                    const authValues = [email, hash, verificationToken];
                    
                    const insertUserResponse = await db.query(insertUser, userValues);
                    const insertAuthResponse = await db.query(insertAuth, authValues);
                    if (insertUserResponse.rowCount === 0 && insertAuthResponse.rowCount === 0) {
                        errors['register-message'] = "There was an error registring your information. Please try again later.";
                        const deleteUser = "DELETE FROM users WHERE email = $1";
                        const deleteAuth = "DELETE FROM auth WHERE email = $1";
                        const deleteValues = [email];

                        await db.query(deleteUser, deleteValues);
                        await db.query(deleteAuth, deleteValues);
                        res.status(502).json({errors});
                    } else if (insertUserResponse.rowCount > 0 && insertAuthResponse.rowCount > 0) {
                        // Generate verification token
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: 'm4rck4n24@gmail.com',
                                pass: process.env.MAIL_TOKEN
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
                        if (mailInfo.accepted.length === 0) {
                            errors['register-message'] = "We couldn't send you a verification email. Please try again later."
                            res.status(502).json({errors});
                        } else {
                            res.send("success");
                            // Redirect to email verification
                        }
                    }
                }
            } catch (err) {
                console.log(err);
                errors['register-message'] = "There was an error in the registration process. Please try again later.";
                res.status(502).json({errors});
            }
        }

        registerUser();
    }
})

app.get('/email-verification/:verificationToken', (req, res) => {
    const verificationToken = req.params.verificationToken;
    jwt.verify(verificationToken, process.env.TOKEN_VERIFICATION_SECRET, (err, decoded) => {
        if (err) {
            // Redirect to error front-end
            res.status(400).send('The token is invalid. Please verify the link is correct.');
        } else {
            const activateUser = async () => {
                const email = decoded.email;
                const selectAuth = "SELECT id FROM auth WHERE email = $1";
                const authValues = [email];
                try {
                    const selectAuthResponse = await db.query(selectAuth, authValues);
                    if (selectAuthResponse.rowCount === 0) {
                        throw Error('Email not found.');
                    } else if (selectAuthResponse.rowCount > 0) {
                        const updateAuth = "UPDATE auth SET activation = $1 WHERE email = $2";
                        const authValues = ["active", email];

                        const updateAuthResponse = await db.query(updateAuth, authValues);
                        if (updateAuthResponse.rowCount === 0) {
                            throw Error('Failed to update database.')
                        } else if (updateAuthResponse.rowCount > 0) {
                            console.log('User activated');
                            res.send("success");
                            // Redirect to activation front-end
                        }
                    }
                } catch (err) {
                    console.log(err);
                    // Redirect to error front-end
                    res.status(400).send("Something went wrong during the activation process. Please try again later.");
                }
            }

            activateUser();
        }
    });

    // Verify email and redirect to front-end
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