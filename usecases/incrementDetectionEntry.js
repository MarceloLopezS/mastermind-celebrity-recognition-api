import User from "../entities/user.js"

const incrementDetectionEntry = (userEntriesModel) => async ({ email }) => {
  const user = new User({ email })

  return await userEntriesModel.incrementDetectionEntry(user)
}

export default incrementDetectionEntry