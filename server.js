import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import multer from 'multer';
import crypto from 'crypto';
import db from './database/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ClarifaiStub, grpc } from 'clarifai-nodejs-grpc';
import login from './controllers/login.js';
import logout from './controllers/logout.js';
import register from './controllers/register.js';
import emailVerification from './controllers/emailVerification.js';
import authorizeUser from './middlewares/authorizeUser.js';
import userInfo from './controllers/userInfo.js';
import forgotPassword from './controllers/forgotPassword.js';
import passwordRecovery from './controllers/passwordRecovery.js';
import faceDetection from './controllers/faceDetection.js';
import incrementEntry from './controllers/incrementEntry.js';

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
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads')
}
const upload = multer({ storage });

app.use(cors({
    origin: process.env.FRONT_END_DOMAIN,
    credentials: true
}))
app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Accessible at <domain>/uploads/<fileName>

app.get('/', (req, res) => res.status(200).json({ status: "success" }));
app.post('/login', login(db, bcrypt, jwt));
app.post('/logout', logout);
app.post('/register', register(db, bcrypt, jwt));
app.get('/email-verification/:verificationToken', emailVerification(db, jwt));
app.post('/forgot-password', forgotPassword(db, jwt));
app.post('/password-recovery', passwordRecovery(db, jwt, bcrypt));
app.get('/user-info', authorizeUser, userInfo(db));
app.post('/face-detection', authorizeUser, upload.single('image-input'), faceDetection(fs, ClarifaiStub, grpc));
app.put('/face-detection/increment-entry', authorizeUser, incrementEntry(db));

app.listen(process.env.PORT || 3001, () => {
    console.log(`Listening to port ${process.env.PORT || 3001}`);
})