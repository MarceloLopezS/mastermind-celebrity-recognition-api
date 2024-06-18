import { isValidEmail } from "../../utilities/functions"

class RegisterController {
  #registerUser

  constructor(handleUserRegister) {
    this.#registerUser = handleUserRegister
  }

  register = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body
    let errors = {} // Errors -> key = Input html id, value = Message

    if (!name) {
      errors["user-name"] = "Please enter your name"
    }
    if (!email) {
      errors["user-email"] = "Please enter your email"
    } else {
      if (!isValidEmail(email)) {
        errors["user-email"] = "Please enter a valid email"
      }
    }
    if (!password) {
      errors["user-password"] = "Please enter a password"
    } else if (password.length < 8) {
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
      try {
        const result = await this.#registerUser({ name, email, password })
        if (result.status === "success") res.status(200).json(result)
      } catch (err) {
        console.log(err)
        res.status(502).json({
          status: "fail",
          fail: {
            message: "There was an error in the registration process. Please try again later."
          }
        })
      }
    }
  }
}

export default RegisterController