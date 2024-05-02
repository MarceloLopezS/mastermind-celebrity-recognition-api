import nodemailer from "nodemailer"

const sendEmail = async mailOptions => {
  /* 
        mailOptions:

        // to -> Email where the message will be sent to.
        // subject -> Subject of the email.
        // html -> Html to render in the mail. NOT include when text property is added as option.
        // text -> Text to be sent in the mail. NOT include when html property is added as option.
    */
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
  const mailInfo = await transporter.sendMail({
    from: `"Mastermind" <${process.env.EMAIL_USER}>`,
    ...mailOptions
  })

  return mailInfo
}

export default sendEmail
