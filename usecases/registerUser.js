import Account from "../entities/account.js"
import User from "../entities/user.js"

const registerUser = (userModel) => async (
  { name, email, password }
) => {
  const user = new User(
    { name, email }
  )
  const account = new Account({ email, password })

  return await userModel.register(user, account)
}

export default registerUser