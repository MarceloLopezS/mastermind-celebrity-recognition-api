class AccountController {
  #activateAccount
  #verifyToken

  constructor(handleAccountActivation, tokenVerifyHandler) {
    this.#activateAccount = handleAccountActivation
    this.#verifyToken = tokenVerifyHandler
  }

  activate = async (req, res) => {
    const verificationToken = req.params.verificationToken

    this.#verifyToken(
      verificationToken,
      async (err, decoded) => {
        if (err) {
          return res.redirect(
            302,
            `${process.env.APP_FRONT_END_URL
            }/email-verification/error/invalid-token`
          )
        }

        const email = decoded.email
        try {
          const result = await this.#activateAccount({ email })
          if (result?.status === "success") {
            res.redirect(
              302,
              `${process.env.APP_FRONT_END_URL
              }/email-verification/activation-success`
            )
          }
        } catch (err) {
          console.log(err)
          return res.redirect(
            302,
            `${process.env.APP_FRONT_END_URL}/email-verification/error`
          )
        }
      }
    )
  }
}

export default AccountController