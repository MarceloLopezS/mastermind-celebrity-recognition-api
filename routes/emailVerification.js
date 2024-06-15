import { Router } from "express"
import jwt from "jsonwebtoken"
import db from "../database/db.js"
import activateAccount from "../usecases/activateAccount.js"
import AccountModel from "../adapters/models/account.js"
import AccountController from "../adapters/controllers/account.js"

const emailVerificationRouter = Router()

const accountModel = new AccountModel(db)
const handleAccountActivation = activateAccount(accountModel)
const tokenVerifyHandler = (token, callback) =>
  jwt.verify(token, process.env.TOKEN_VERIFICATION_SECRET, callback)
const accountController =
  new AccountController(handleAccountActivation, tokenVerifyHandler)

emailVerificationRouter.get(
  "/:verificationToken",
  accountController.activate
)

export default emailVerificationRouter