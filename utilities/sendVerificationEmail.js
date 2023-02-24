import nodemailer from 'nodemailer';

const sendVerificationEmail = async (email, verificationToken) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })
    const mailOptions = {
        from: '"Mastermind" <m4rck4n24@gmail.com>',
        to: email,
        subject: 'Verify you Mastermind account',
        html: `
            <html>
            <head>
                <style>
                    h1 {
                        color: #00abb8;
                    }
                    a {
                        color: #ffc342;
                    }
                    a::hover, a:active {
                        color: #f6b831;
                    }
                </style>
            </head>
            <body>
                <h1>Hello! Please verify your Mastermind account:</h1>
                <p>In order to be able to log in and use face detection on images through our app, you need to verify your account.</p>
                <p>
                    Please click in the following link or copy and paste it into your browser: 
                </p>
                <p>
                    <a href="http://localhost:3001/email-verification/${verificationToken}">
                        http://localhost:3001/email-verification/${verificationToken}
                    </a>
                </p>
            </body>
            <html>
        `
    }
    const mailInfo = await transporter.sendMail(mailOptions);

    return mailInfo;
}

export default sendVerificationEmail;