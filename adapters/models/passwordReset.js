export class PasswordResetValidationModel {
  #db
  #signToken
  #sendMail

  constructor(db, tokenSignHandler, sendMailFunction) {
    this.#db = db
    this.#signToken = tokenSignHandler
    this.#sendMail = sendMailFunction
  }

  validateRequest = async recoveryEmail => {
    const { email } = recoveryEmail
    const selectUser = "SELECT * FROM users WHERE email = $1"
    const selectUserValues = [email]

    const selectUserResponse =
      await this.#db.query(selectUser, selectUserValues)

    if (selectUserResponse.rowCount === 0) {
      return {
        status: "fail",
        statusCode: 400,
        fail: { message: "This email is not registered." }
      }
    }

    const resetToken = this.#signToken({ email })
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
                <a href="${process.env.APP_FRONT_END_URL}/password-reset/${resetToken}">
                    ${process.env.APP_FRONT_END_URL}/password-reset/${resetToken}
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

    const mailInfo = await this.#sendMail(mailOptions)
    if (mailInfo.accepted.length === 0) {
      return {
        status: "fail",
        statusCode: 502,
        fail: {
          message:
            "We were not able to send the reset mail. Please try again later."
        }
      }
    }

    return {
      status: "success",
      statusCode: 200,
      success: {
        message:
          "We have successfully sent a reset email. Please check your email inbox."
      }
    }
  }
}

export class PasswordResetModel {
  #db
  #hash

  constructor(db, passwordHashHandler) {
    this.#db = db
    this.#hash = passwordHashHandler
  }

  reset = async (account) => {
    const { email, password } = account
    const selectUser = "SELECT * FROM users WHERE email = $1"
    const selectUserValues = [email]

    const selectUserResponse = await this.#db.query(
      selectUser,
      selectUserValues
    )
    if (selectUserResponse.rows === 0) {
      return {
        status: "fail",
        statusCode: 502,
        fail: {
          message:
            "We were not able to identify you. Please try making the reset process again."
        }
      }
    }

    const hash = await this.#hash(password)
    const updateAuth = "UPDATE auth SET hash = $1 WHERE email = $2"
    const updateAuthValues = [hash, email]

    const updateAuthResponse = await this.#db.query(
      updateAuth,
      updateAuthValues
    )
    if (updateAuthResponse.rowCount === 0) {
      return {
        status: "fail",
        statusCode: 502,
        fail: {
          message:
            "We were not able to update the password. Please try again later."
        }
      }
    }

    return {
      status: "success",
      statusCode: 200
    }
  }
}