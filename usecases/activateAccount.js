import Account from "../entities/account.js"

const activateAccount = (accountModel) => async ({ email }) => {
  const account = new Account(
    { email }
  )

  return await accountModel.activate(account)
}

export default activateAccount