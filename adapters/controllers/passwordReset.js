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