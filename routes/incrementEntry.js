import db from '../database/db.js';
import jwt from 'jsonwebtoken';

const incrementEntry = async (req, res, next) => {
    if (!req.authorizedUser) {
        return res.status(403).json({
            status: 'unauthorized'
        })
    }

    // Increment user entries
    const userEmail = req.authorizedUser;
    const selectUserQuery = "SELECT * FROM users WHERE email = $1";
    const selectUserValues = [userEmail];

    const selectUserResponse = await db.query(selectUserQuery, selectUserValues);
    if (selectUserResponse.rowCount === 0) {
        return res.status(500).json({
            status: 'fail'
        })
    }

    const newUserEntries = selectUserResponse.rows[0].entries + 1;
    const updateUserQuery = "UPDATE users SET entries = $1 WHERE email = $2";
    const updateUserValues = [newUserEntries, userEmail];

    const updateUserResponse = await db.query(updateUserQuery, updateUserValues);
    if (updateUserResponse.rowCount === 0) {
        return res.status(500).json({
            status: 'fail'
        })
    }

    return res.status(200).json({
        status: 'success'
    })
}

export default incrementEntry;