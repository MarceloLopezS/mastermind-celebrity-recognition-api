import Credentials from "../entities/credentials.js"

const loginUser = (loginModel) => async ({ email, password }) => {
  const credentials = new Credentials({ email, password })

  return await loginModel.login(credentials)
}

export default loginUser