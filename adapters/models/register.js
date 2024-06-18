class RegisterModel {
  #db
  #hash
  #signToken
  #sendMail

  constructor(db, passwordHashHandler, tokenSignHandler, sendMailHandler) {
    this.#db = db
    this.#hash = passwordHashHandler
    this.#signToken = tokenSignHandler
    this.#sendMail = sendMailHandler
  }

  register = async (user, account) => {
    const selectUser = "SELECT * FROM users WHERE email = $1"
    const selectUserValues = [user.email]

    const selectUserResponse = await this.#db.query(selectUser, selectUserValues)
    if (selectUserResponse.rowCount > 0) {
      throw new Error("This email is already registered.")
    }

    const verificationToken = this.#signToken({ email: user.email })

    this.#db.query("BEGIN;")
    try {
      user.setEntriesCount(0)
      user.setJoinedTimestamp(new Date())
      const insertUser =
        "INSERT INTO users (name, email, joined) VALUES ($1, $2, $3);"
      const insertUserValues = [user.name, user.email, user.joined]
      const insertUserResponse =
        await this.#db.query(insertUser, insertUserValues)

      account.setActivation(verificationToken)
      account.setExpiration(new Date(Date.now() + 24 * 60 * 60 * 1000))
      const insertAuth =
        "INSERT INTO auth (email, hash, activation, expiration) VALUES ($1, $2, $3, $4);"
      const insertAuthValues = [
        account.email,
        await this.#hash(account.password),
        account.activation,
        account.expiration
      ]
      const insertAuthResponse =
        await this.#db.query(insertAuth, insertAuthValues)

      if (
        insertUserResponse.rowCount > 0 &&
        insertAuthResponse.rowCount > 0
      ) {
        const mailOptions = {
          to: account.email,
          subject: "Verify you Mastermind account",
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
                                    <a href="${process.env.APP_API_URL}/email-verification/${verificationToken}">
                                        ${process.env.APP_API_URL}/email-verification/${verificationToken}
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
        const mailInfo = await this.#sendMail(mailOptions)
        if (mailInfo.accepted.length === 0) {
          await this.#db.query("ROLLBACK;")
          throw new Error(
            "We were not able to send the activation email. Please try again later."
          )
        }

        await this.#db.query("COMMIT;")
        return { status: "success" }
      }
    } catch (err) {
      await this.#db.query("ROLLBACK;")
      throw new Error(
        `Error during registration: ${err}`
      )
    }
  }
}

export default RegisterModel