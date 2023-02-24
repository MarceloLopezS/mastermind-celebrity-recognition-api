import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import login from './routes/login.js';
import logout from './routes/logout.js';
import register from './routes/register.js';
import emailVerification from './routes/emailVerification.js';
import authorizeUser from './middlewares/authorizeUser.js';
import userInfo from './routes/userInfo.js';

const app = express();

app.use(cors( {
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.post('/login', login);
app.post('/logout', logout);
app.post('/register', register);
app.get('/email-verification/:verificationToken', emailVerification);
app.get('/user-info', authorizeUser, userInfo);
app.put('/face-detection/image-entry', authorizeUser, (req, res) => {
    // Use the user ID's cookie to edit it's faceEntries when one image is submited. Then send a response with the updated entries.
})

app.listen(process.env.PORT || 3001, () => {
    console.log(`Listening to port ${process.env.PORT || 3001}`);
})