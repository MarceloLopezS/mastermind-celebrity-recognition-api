import stringDateToTimestamp from "./stringDateToTimestamp.js"

const deleteExpiredUsers = async db => {
  const selectUsersQuery = "SELECT * FROM auth"
  const selectUsersResponse = await db.query(selectUsersQuery)
  const expiredEmails = selectUsersResponse.rows
    .filter(row => {
      if (
        row.expiration !== "infinity" &&
        stringDateToTimestamp(row.expiration) < Date.now()
      )
        return true
    })
    .map(row => row.email)
  try {
    db.query("BEGIN;")
    expiredEmails.forEach(async email => {
      const deleteUsersQuery = "DELETE FROM users WHERE email = $1;"
      const deleteUserValues = [email]
      await db.query(deleteUsersQuery, deleteUserValues)

      const deleteAuthsQuery = "DELETE FROM auth WHERE email = $1;"
      await db.query(deleteAuthsQuery, deleteUserValues)
    })

    await db.query("COMMIT;")
  } catch (err) {
    console.log(err)
    db.query("ROLLBACK;")
  }
}

export default deleteExpiredUsers
