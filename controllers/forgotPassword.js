import sendEmail from "../utilities/sendEmail.js"

const forgotPassword = (db, jwt) => (req, res) => {
  const { email } = req.body
  const errors = {}

  if (!email) {
    errors["user-email"] = "Please enter your email"
  } else {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    if (!email.match(emailRegex)) {
      errors["user-email"] = "Please enter a valid email"
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      status: "user-errors",
      errors
    })
  }

  const sendResetEmail = async () => {
    const selectUser = "SELECT * FROM users WHERE email = $1"
    const selectUserValues = [email]
    try {
      const selectUserResponse = await db.query(selectUser, selectUserValues)
      if (selectUserResponse.rowCount === 0) {
        return res.status(400).json({
          status: "fail",
          fail: { message: "This email is not registered." }
        })
      }

      const resetToken = jwt.sign(
        { email },
        process.env.TOKEN_PASS_RESET_SECRET,
        { expiresIn: "15m" }
      )
      const mailOptions = {
        to: email,
        subject: "Password reset",
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
                        <h1>Hello! You requested a password reset:</h1>
                        <p>To proceed with the reset, please click in the following link or paste it into your browser:</p>
                        <p>
                            <a href="${process.env.FRONT_END_DOMAIN}/password-reset/${resetToken}">
                                ${process.env.FRONT_END_DOMAIN}/password-reset/${resetToken}
                            </a>
                        </p>
                        <p>
                            This link will expire in 15 minutes. If you did not asked for a password reset, you can safely ignore this email.
                        </p>
                        <p>Best,</p>
                        <p>Mastermind Team</p>
                    </body>
                    <html>
                `
      }

      const mailInfo = await sendEmail(mailOptions)
      if (mailInfo.accepted.length === 0) {
        return res.status(502).json({
          status: "fail",
          fail: {
            message:
              "We were not able to send the reset mail. Please try again later."
          }
        })
      }

      return res.status(200).json({
        status: "success",
        success: {
          message:
            "We have successfully sent a reset email. Please check your email inbox."
        }
      })
    } catch (err) {
      console.log(err)
      return res.status(502).json({
        status: "fail",
        fail: {
          message: "There was an error in the process. Please try again later."
        }
      })
    }
  }

  sendResetEmail()
}

export default forgotPassword
