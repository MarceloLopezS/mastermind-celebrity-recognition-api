import { stringDateToTimestamp } from "../../utilities/functions.js"

export class ActivationModel {
  #db

  constructor(db) {
    this.#db = db
  }

  activate = async account => {
    const selectAuth = "SELECT * FROM auth WHERE email = $1"
    const selectAuthValues = [account.email]

    const selectAuthResponse = await this.#db.query(
      selectAuth,
      selectAuthValues
    )
    if (selectAuthResponse.rowCount === 0) {
      throw Error("Email not found.")
    }

    if (
      selectAuthResponse.rows[0].expiration !== "infinity" &&
      stringDateToTimestamp(selectAuthResponse.rows[0].expiration) <
      Date.now()
    ) {
      throw Error("Activation link expired.")
    }

    if (selectAuthResponse.rows[0].activation === "active") {
      return { status: "success" }
    }

    account.setActivation("active")
    account.setExpiration(Infinity)
    const updateAuth =
      "UPDATE auth SET activation = $1, expiration = $2 WHERE email = $3"
    const updateAuthValues = [
      account.activation,
      account.expiration,
      account.email
    ]

    const updateAuthResponse = await this.#db.query(
      updateAuth,
      updateAuthValues
    )
    if (updateAuthResponse.rowCount === 0) {
      throw Error("Failed to update database.")
    }

    return { status: "success" }
  }
}