import express from 'express';
import bcrypt from 'bcrypt';
import db from './database/db.js';

const app = express();

app.use(express.json());

const databasePlaceholder = {
    users: [
        {
            id: 120,
            name: "Marcelo Lopez",
            email: "marcelo-lo@outlook.com",
            faceEntries: 0,
            joined: new Date(),
            activated: ""
        }
    ],
    login: [
        {
            user_id: 120,
            password: "openthedoor",
        }
    ]
}

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
        const dbEmail = databasePlaceholder.users.at(-1).email;
        if(!dbEmail) {
            errors["login-message"] = "Incorrect email or password.";
            res.status(400).json(errors);
        } else {
            const authUser = async () => {
                const dbPassword = databasePlaceholder.login.at(-1).password;
                const hashMatch = await bcrypt.compare(password, dbPassword);
                if (!(email === dbEmail && hashMatch)) {
                    errors["login-message"] = "Incorrect email or password.";
                    res.status(400).json(errors);
                } else {
                    res.send("success");
                    // Create a user ID cookie.
                    // Redirect to /face-detection
                }
            }

            authUser();
        }
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
            const saltRounds = 0;
            const hash = await bcrypt.hash(password, saltRounds);
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
                    const authValues = [email, hash, "active"];
                    
                    const insertUserResponse = await db.query(insertUser, userValues);
                    const insertAuthResponse = await db.query(insertAuth, authValues);
                    if (!(insertUserResponse.rowCount > 0 && insertAuthResponse.rowCount > 0)) {
                        errors['register-message'] = "There was an error registring your information. Please try again later.";
                        const deleteUser = "DELETE FROM users WHERE email = $1";
                        const deleteAuth = "DELETE FROM auth WHERE email = $1";
                        const deleteValues = [email];

                        await db.query(deleteUser, deleteValues);
                        await db.query(deleteAuth, deleteValues);
                        res.status(502).json({errors});
                    } else {
                        res.send("success");
                        // Redirect to email verification
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

app.get('/face-detection', (req, res) => {
    // Once a user ID cookie is created, respond with the user's data.
})

app.put('/face-detection/image-entry', (req, res) => {
    // Use the user ID's cookie to edit it's faceEntries when one image is submited. Then send a response with the updated entries.
})

app.listen(process.env.PORT || 3001, () => {
    console.log(`Listening to port ${process.env.PORT || 3001}`);
})