import { isValidEmail } from "../../utilities/functions.js"

export class PasswordResetValidationController {
  #validateRequest

  constructor(handleRequestValidation) {
    this.#validateRequest = handleRequestValidation
  }

  validate = async (req, res) => {
    const { email } = req.body
    const errors = {}

    if (!email) {
      errors["user-email"] = "Please enter your email"
    } else {
      if (!isValidEmail(email)) {
        errors["user-email"] = "Please enter a valid email"
      }
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        status: "user-errors",
        errors
      })
    } else {
      try {
        const result = await this.#validateRequest({ email })
        if (result.status !== "success") {
          res.status(result.statusCode).json({
            status: result.status,
            fail: result.fail
          })
        } else {
          res.status(result.statusCode).json({
            status: result.status,
            success: result.success
          })
        }
      } catch (err) {
        console.log(err)
        res.status(502).json({
          status: "fail",
          fail: {
            message: "There was an error in the process. Please try again later."
          }
        })
      }
    }
  }
}

export class PasswordResetController {
  #resetPassword
  #verifyToken

  constructor(passwordResetHandler, tokenVerifyHandler) {
    this.#resetPassword = passwordResetHandler
    this.#verifyToken = tokenVerifyHandler
  }

  resetPassword = (req, res) => {
    const { password, confirmPassword, resetToken } = req.body
    const errors = {}

    if (!password) {
      errors["user-password"] = "Please enter a password"
    } else if (password.split("").length < 8) {
      errors["user-password"] = "Password must have at least 8 characters"
    }
    if (!confirmPassword) {
      errors["user-confirm-password"] = "Please confirm your password"
    } else {
      if (!(password === confirmPassword)) {
        errors["user-password"] = "Passwords don't match"
        errors["user-confirm-password"] = "Passwords don't match"
      }
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        status: "user-errors",
        errors
      })
    } else {
      this.#verifyToken(resetToken, async (err, decoded) => {
        if (err) {
          return res.status(400).json({
            status: "fail",
            fail: {
              message:
                "The token is invalid, please check the link is complete and correct."
            }
          })
        }

        try {
          const email = decoded.email
          const result = await this.#resetPassword({ email, password })

          if (result.status !== "success") {
            res.status(result.statusCode).json({
              status: result.status,
              fail: result.fail
            })
          } else {
            res.status(result.statusCode).json({
              status: result.status
            })
          }
        } catch (err) {
          console.log(err)
          return res.status(502).json({
            status: "fail",
            fail: {
              message:
                "There was an error in the process. Please try again later."
            }
          })
        }
      })
    }
  }
}