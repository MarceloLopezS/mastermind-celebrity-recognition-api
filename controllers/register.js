import sendVerificationEmail from '../utilities/sendVerificationEmail.js';
import deleteExpiredUsers from '../utilities/deleteExpiredUsers.js';

const register = (db, bcrypt, jwt) => (req, res) => {
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
            await deleteExpiredUsers(db);
            const saltRounds = 10;
            const hash = await bcrypt.hash(password, saltRounds);
            try {
                const selectUser = "SELECT * FROM users WHERE email = $1";
                const selectUserValues = [email];

                const selectUserResponse = await db.query(selectUser, selectUserValues);
                if (selectUserResponse.rowCount > 0) {
                    errors["registerMessage"] = "This email is already registered.";
                    return res.status(400).json({
                        status: "fail",
                        errors
                    });
                }

                const verificationToken = jwt.sign({ email }, process.env.TOKEN_VERIFICATION_SECRET, { expiresIn: '1h' });
                
                await db.query('BEGIN;'); // PSQL transaction
                const insertUser = "INSERT INTO users (name, email, joined) VALUES ($1, $2, $3);";
                const insertUserValues = [name, email, new Date()];
                const insertUserResponse = await db.query(insertUser, insertUserValues);

                const insertAuth = "INSERT INTO auth (email, hash, activation, expiration) VALUES ($1, $2, $3, $4);";
                const insertAuthValues = [email, hash, verificationToken, new Date(Date.now() + (24*60*60*1000))];
                const insertAuthResponse = await db.query(insertAuth, insertAuthValues);
                if (insertUserResponse.rowCount > 0 && insertAuthResponse.rowCount > 0) {
                    const mailInfo = await sendVerificationEmail(process.env.SERVER_DOMAIN, email, verificationToken);
                    if (mailInfo.accepted.length === 0) {
                        await db.query('ROLLBACK;')
                        return res.status(502).json({
                            status: "fail",
                        });
                    }
                    
                    await db.query('COMMIT;')
                    return res.status(200).json({
                        status: "success" // Front end redirection to email verification needed
                    });
                }

                return res.status(502).json({
                    status: "fail"
                });
            } catch (err) {
                console.log(err);
                await db.query('ROLLBACK;');
                errors["registerMessage"] = "There was an error in the registration process. Please try again later.";
                return res.status(502).json({
                    status: "fail",
                    errors
                });
            }
        }

        registerUser();
    }
}

export default register;