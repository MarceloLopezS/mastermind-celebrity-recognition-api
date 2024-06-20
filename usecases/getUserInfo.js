import User from "../entities/user.js"

const getUserInfo = (userInfoModel) => async ({ email }) => {
  const user = new User({ email })

  return await userInfoModel.get(user)
}

export default getUserInfo