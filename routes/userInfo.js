import db from '../database/db.js';

const userInfo = (req, res, next) => {
    if (!req.authorizedUser) {
        res.status(200).json({
            status: 'unauthorized'
        })
    } else {
        const sendUserData = async () => {
            try {
                const userEmail = req.authorizedUser;
                const selectUserQuery = 'SELECT * FROM users WHERE email = $1';
                const selectUserValues = [userEmail];

                const selectUserResponse = await db.query(selectUserQuery, selectUserValues);
                if (selectUserResponse.rowCount === 0) {
                    return res.status(502).json({
                        status: 'fail'
                    })
                }

                return res.status(200).json({
                    status: 'success',
                    userInfo: {
                        name: selectUserResponse.rows[0].name,
                        entries: selectUserResponse.rows[0].entries
                    }
                })
            } catch (err) {
                console.log(err);
                return res.status(502).json({
                    status: 'fail'
                })
            }
        }
        
        sendUserData();
    }
}

export default userInfo;