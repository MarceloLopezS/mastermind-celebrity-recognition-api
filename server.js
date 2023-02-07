import express from 'express';
import bcrypt from 'bcrypt';

const app = express();

app.use(express.json());

const databasePlaceholder = {
    users: [
        {
            id: 120,
            name: "Marcelo Lopez",
            email: "marcelo-lo@outlook.com",
            password: "openthedoor",
            faceEntries: 0,
            joined: new Date()
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
        const authUser = async () => {
            const dbEmail = databasePlaceholder.users.at(-1).email;
            const dbPassword = databasePlaceholder.users.at(-1).password;
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
            const newUser = {
                name,
                email,
                password: hash,
                faceEntries: 0,
                joined: new Date()
            }
            databasePlaceholder.users.push(newUser);
            res.json(databasePlaceholder.users.at(-1));
            // Redirect to /email-confirm
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