import { isValidEmail } from "../../utilities/functions.js"

const SESSION_TOKEN_KEY = "utoken"
const COOKIE_OPTIONS = {
  secure: true, // false for local development
  httpOnly: true,
  sameSite: "None" // 'lax' for local development
}

export class LoginController {
  #handleLogin

  constructor(handleLogin) {
    this.#handleLogin = handleLogin
  }

  login = async (req, res) => {
    const { email, password } = req.body
    const errors = {} // Errors -> key = Input html id, value = Message

    if (!email) {
      errors["user-email"] = "Please enter your email"
    } else {
      if (!isValidEmail(email)) {
        errors["user-email"] = "Please enter a valid email"
      }
    }

    if (!password) {
      errors["user-password"] = "Please enter your password"
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        status: "user-errors",
        errors
      })
    } else {
      try {
        const result = await this.#handleLogin({ email, password })

        if (result.status !== "success") {
          return res.status(400).json(result)
        } else {
          const { userToken } = result.success

          res.cookie(SESSION_TOKEN_KEY, userToken, COOKIE_OPTIONS)
          res.status(400).json({ status: "success" })
        }
      } catch (err) {
        console.log(err)
        res.status(502).json({
          status: "fail",
          fail: {
            message:
              "There was an error in the login process. Please try again later."
          }
        })
      }
    }
  }
}