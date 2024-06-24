export class UserInfoModel {
  #db

  constructor(db) {
    this.#db = db
  }

  get = async (user) => {
    const { email } = user
    const selectUserQuery = "SELECT * FROM users WHERE email = $1"
    const selectUserValues = [email]

    const selectUserResponse = await this.#db.query(
      selectUserQuery,
      selectUserValues
    )
    if (selectUserResponse.rowCount === 0) {
      return {
        status: "fail",
        statusCode: 502
      }
    }

    user.setUserName(selectUserResponse.rows[0].name)
    user.setEntriesCount(selectUserResponse.rows[0].entries)

    return {
      status: "success",
      statusCode: 200,
      userInfo: {
        name: user.name,
        entries: user.entries
      }
    }
  }
}

export class UserEntriesModel {
  #db

  constructor(db) {
    this.#db = db
  }

  incrementDetectionEntry = async (user) => {
    const selectUserQuery = "SELECT * FROM users WHERE email = $1"
    const selectUserValues = [user.email]

    const selectUserResponse =
      await this.#db.query(selectUserQuery, selectUserValues)
    if (selectUserResponse.rowCount === 0) {
      return {
        status: "fail",
        statusCode: 500
      }
    }

    const newUserEntries = parseInt(selectUserResponse.rows[0].entries) + 1
    user.setEntriesCount(newUserEntries)

    const updateUserQuery = "UPDATE users SET entries = $1 WHERE email = $2"
    const updateUserValues = [user.entries, user.email]

    const updateUserResponse =
      await this.#db.query(updateUserQuery, updateUserValues)
    if (updateUserResponse.rowCount === 0) {
      return {
        status: "fail",
        statusCode: 500
      }
    }

    return {
      status: "success"
    }
  }
}