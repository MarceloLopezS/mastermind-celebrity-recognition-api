import { Router } from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import db from "../database/db.js"
import resetPassword from "../usecases/resetPassword.js"
import { PasswordResetModel } from "../adapters/models/passwordReset.js"
import { PasswordResetController } from "../adapters/controllers/passwordReset.js"

const passwordResetRouter = Router()
const SALT_ROUNDS = 10

const passwordHashHandler = (pass) => bcrypt.hash(pass, SALT_ROUNDS)
const tokenVerifyHandler = (token, callback) => jwt.verify(
  token,
  process.env.TOKEN_PASS_RESET_SECRET,
  callback
)
const passwordResetModel = new PasswordResetModel(db, passwordHashHandler)
const passwordResetHandler = resetPassword(passwordResetModel)
const passwordResetController = new PasswordResetController(
  passwordResetHandler,
  tokenVerifyHandler
)

passwordResetRouter.post("/", passwordResetController.resetPassword)

export default passwordResetRouter