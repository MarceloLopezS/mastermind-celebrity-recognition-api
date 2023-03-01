import db from '../database/db.js';
import jwt from 'jsonwebtoken';

const emailVerification = (req, res, next) => {
    const verificationToken = req.params.verificationToken;
    jwt.verify(verificationToken, process.env.TOKEN_VERIFICATION_SECRET, (err, decoded) => {
        if (err) {
            return res.redirect(302, `${process.env.FRONT_END_DOMAIN}/email-verification/error/invalid-token`);
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
                        return res.redirect(302, `${process.env.FRONT_END_DOMAIN}/email-verification/activation-success`);
                    }

                    const updateAuth = "UPDATE auth SET activation = $1 WHERE email = $2";
                    const updateAuthValues = ['active', email];

                    const updateAuthResponse = await db.query(updateAuth, updateAuthValues);
                    if (updateAuthResponse.rowCount === 0) {
                        throw Error("Failed to update database.")
                    }

                    return res.redirect(302, `${process.env.FRONT_END_DOMAIN}/email-verification/activation-success`);
                } catch (err) {
                    console.log(err);
                    return res.redirect(302, `${process.env.FRONT_END_DOMAIN}/error`);
                }
            }

            activateUser();
        }
    });
}

export default emailVerification;