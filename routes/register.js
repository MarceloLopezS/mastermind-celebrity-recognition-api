import db from '../database/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendVerificationEmail from '../utilities/sendVerificationEmail.js';

const register = (req, res, next) => {
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
        const registerUser = async () => {
            const saltRounds = 10;
            const hash = await bcrypt.hash(password, saltRounds);
            try {
                const selectUser = "SELECT $1 FROM users WHERE email = $2";
                const selectUserValues = ['activation', email];

                const selectUserResponse = await db.query(selectUser, selectUserValues);
                if (selectUserResponse.rowCount > 0) {
                    errors["registerMessage"] = "This email is already registered.";
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
                    const mailInfo = await sendVerificationEmail(email, verificationToken);
                    if (mailInfo.accepted.length === 0) {
                        errors["registerMessage"] = "We couldn't send you a verification email. Please try again later."
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
                        status: "success" // Front end redirection to email verification needed
                    });
                }
            } catch (err) {
                console.log(err);
                errors["registerMessage"] = "There was an error in the registration process. Please try again later.";
                res.status(502).json({
                    status: "fail",
                    errors
                });
            }
        }

        registerUser();
    }
}

export default register;