const passwordRecovery = (db, jwt, bcrypt) => (req, res) => {
    const { password, confirmPassword, recoveryToken } = req.body;
    const errors = {};
    
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
        const changeUserPassword = async () => {
            jwt.verify(recoveryToken, process.env.TOKEN_PASS_RECOVERY_SECRET, async (err, decoded) => {
                if (err) {
                    return res.status(400).json({
                        status: "fail",
                        message: "The token is invalid, please check the link is complete and correct."
                    })
                }

                try {
                    const email = decoded.email;
                    const selectUser = "SELECT * FROM users WHERE email = $1";
                    const selectUserValues = [email];
                    
                    const selectUserResponse = await db.query(selectUser, selectUserValues);
                    if (selectUserResponse.rows === 0) {
                        return res.status(502).json({
                            status: "fail",
                            message: "We were not able to identify you. Please try making the recovery again."
                        })
                    }
                    
                    const saltRounds = 10;
                    const hash = await bcrypt.hash(password, saltRounds);
                    const updateAuth = "UPDATE auth SET hash = $1 WHERE email = $2";
                    const updateAuthValues = [hash, email];

                    const updateAuthResponse = await db.query(updateAuth, updateAuthValues);
                    if (updateAuthResponse.rowCount === 0) {
                        return res.status(502).json({
                            status: "fail",
                            message: "We were not able to update the password. Please try again later."
                        })
                    }

                    return res.status(200).json({
                        status: "success"
                    })
                } catch (err) {
                    console.log(err);
                    return res.status(502).json({
                        status: "fail",
                        message: "There was an error in the process. Please try again later."
                    });
                }
            })
        }

        changeUserPassword();
    }
}
export default passwordRecovery