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