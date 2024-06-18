export class LoginModel {
  #db
  #compareHash
  #signToken

  constructor(db, hashComparisonHandler, tokenSignHandler) {
    this.#db = db
    this.#compareHash = hashComparisonHandler
    this.#signToken = tokenSignHandler
  }

  login = async (credentials) => {
    const { email, password } = credentials

    const selectAuth = "SELECT * FROM auth WHERE email = $1"
    const authValues = [email]

    const selectAuthResponse =
      await this.#db.query(selectAuth, authValues)

    if (selectAuthResponse.rowCount === 0) {
      return {
        status: "fail",
        fail: { message: "Incorrect email or password." }
      }
    }

    const userAuthRow = selectAuthResponse.rows[0]
    if (userAuthRow.activation !== "active") {
      return {
        status: "fail",
        fail: { message: "This account is not yet activated." }
      }
    }

    const hashMatch = await this.#compareHash(password, userAuthRow.hash)
    if (!hashMatch) {
      return {
        status: "fail",
        fail: { message: "Incorrect email or password." }
      }
    }

    const userToken = this.#signToken({ email })

    return {
      status: "success",
      success: { userToken }
    }
  }
}