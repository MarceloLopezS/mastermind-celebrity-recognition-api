import { Router } from "express"
import jwt from "jsonwebtoken"
import db from "../database/db.js"
import activateAccount from "../usecases/activateAccount.js"
import { ActivationModel } from "../adapters/models/account.js"
import { ActivationController } from "../adapters/controllers/account.js"

const emailVerificationRouter = Router()

const activationModel = new ActivationModel(db)
const handleAccountActivation = activateAccount(activationModel)
const tokenVerifyHandler = (token, callback) =>
  jwt.verify(token, process.env.TOKEN_VERIFICATION_SECRET, callback)
const activationController =
  new ActivationController(handleAccountActivation, tokenVerifyHandler)

emailVerificationRouter.get(
  "/:verificationToken",
  activationController.activate
)

export default emailVerificationRouter