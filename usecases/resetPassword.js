import Account from "../entities/account.js"

const resetPassword = (passwordResetModel) =>
  async ({ email, password }) => {
    const account = new Account({ email, password })

    return await passwordResetModel.reset(account)
  }

export default resetPassword