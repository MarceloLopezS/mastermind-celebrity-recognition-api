import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import crypto from 'crypto';
import login from './routes/login.js';
import logout from './routes/logout.js';
import register from './routes/register.js';
import emailVerification from './routes/emailVerification.js';
import authorizeUser from './middlewares/authorizeUser.js';
import userInfo from './routes/userInfo.js';
import faceDetection from './routes/faceDetection.js';
import incrementEntry from './routes/incrementEntry.js';

const app = express();
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads');
    },
    filename: (req, file, callback) => {
        const filename = crypto.randomBytes(16).toString('hex');
        const fileOriginalExtension = file.originalname.split(".").at(-1);
        callback(null, `${filename}.${fileOriginalExtension}`);
    }
})
const upload = multer({ storage });

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
app.post('/face-detection', authorizeUser, upload.single('image-input'), faceDetection);
app.put('/face-detection/increment-entry', authorizeUser, incrementEntry);

app.listen(process.env.PORT || 3001, () => {
    console.log(`Listening to port ${process.env.PORT || 3001}`);
})