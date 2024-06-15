import Account from "../entities/account.js"
import User from "../entities/user.js"

const registerUser = (registerModel) => async (
  { name, email, password }
) => {
  const user = new User(
    { name, email }
  )
  const account = new Account({ email, password })

  return await registerModel.register(user, account)
}

export default registerUser