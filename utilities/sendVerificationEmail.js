import nodemailer from 'nodemailer';

const sendVerificationEmail = async (serverDomain, email, verificationToken) => {
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
                    <a href="${serverDomain}/email-verification/${verificationToken}">
                        ${serverDomain}/email-verification/${verificationToken}
                    </a>
                </p>
                <p>
                    This link will expire in 24 hours. If you did not signed for a Mastermind account, you can safely ignore this email.
                </p>
                <p>Best,</p>
                <p>Mastermind Team</p>
            </body>
            <html>
        `
    }
    const mailInfo = await transporter.sendMail(mailOptions);

    return mailInfo;
}

export default sendVerificationEmail;