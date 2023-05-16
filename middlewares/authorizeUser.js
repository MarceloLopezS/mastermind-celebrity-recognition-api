import jwt from 'jsonwebtoken';

const authorizeUser = (req, res, next) => {
    if (req.cookies.utoken && req.cookies.utoken.match(/\S+\.\S+\.\S+/)) {
        const userToken = req.cookies.utoken;
        jwt.verify(userToken, process.env.TOKEN_ACCESS_SECRET, (err, decoded) => {
            if (err) {
                req.authorizedUser = null;
                next();
            } else {
                req.authorizedUser = decoded.email;
                next();
            }
        });
    } else {
        req.authorizedUser = null;
        next();
    }
}

export default authorizeUser