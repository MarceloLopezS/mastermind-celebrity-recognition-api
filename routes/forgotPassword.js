import { Router } from "express"
import jwt from "jsonwebtoken"
import db from "../database/db.js"
import sendEmail from "../utilities/sendEmail.js"
import validatePasswordResetRequest from "../usecases/validatePasswordResetRequest.js"
import { PasswordResetValidationModel } from "../adapters/models/passwordReset.js"
import { PasswordResetValidationController } from "../adapters/controllers/passwordReset.js"

const forgotPasswordRouter = Router()

const TOKEN_EXPIRATION = "15m"
const tokenSignHandler = (payload) => jwt.sign(
  payload,
  process.env.TOKEN_PASS_RESET_SECRET,
  { expiresIn: TOKEN_EXPIRATION }
)
const passwordResetValidationModel =
  new PasswordResetValidationModel(db, tokenSignHandler, sendEmail)
const handleRequestValidation =
  validatePasswordResetRequest(passwordResetValidationModel)
const passwordResetValidationController =
  new PasswordResetValidationController(handleRequestValidation)

forgotPasswordRouter.post(
  "/",
  passwordResetValidationController.validate
)

export default forgotPasswordRouter