const login = (db, bcrypt, jwt) => (req, res) => {
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
                    errors["loginMessage"] = "Incorrect email or password.";
                    return res.status(400).json({
                        status: "fail",
                        errors
                    });
                }
                
                const userAuthRow = selectAuthResponse.rows[0];
                if (userAuthRow.activation !== 'active') {
                    errors["loginMessage"] = "This account is not yet activated."
                    return res.status(400).json({
                        status: "fail",
                        errors
                    });
                }

                const hashMatch = await bcrypt.compare(password, userAuthRow.hash);
                if (!hashMatch) {
                    errors["loginMessage"] = "Incorrect email or password.";
                    return res.status(400).json({
                        status: "fail",
                        errors
                    });
                }

                // Create a user token cookie.
                const userToken = jwt.sign({ email }, process.env.TOKEN_ACCESS_SECRET);
                const cookieOptions = {
                    secure: false,
                    httpOnly: true,
                    sameSite: 'lax'
                }
                res.cookie("utoken", userToken, cookieOptions);
                // Redirect to /face-detection
                return res.json({
                    status: "success"
                });
            } catch (err) {
                console.log(err);
                errors["loginMessage"] = "There was an error in the login process. Please try again later.";
                return res.status(502).json({
                    status: "fail",
                    errors
                });
            }
        }

        authUser();
    }
}

export default login;