import { Router } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import db from "../database/db.js"
import sendEmail from "../utilities/sendEmail.js"
import registerUser from "../usecases/registerUser.js"
import RegisterModel from "../adapters/models/register.js"
import RegisterController from "../adapters/controllers/register.js"

const registerRouter = Router()

const passwordHashHandler = (password) => bcrypt.hash(password, 10)
const tokenSignHandler = (value) =>
  jwt.sign(value, process.env.TOKEN_VERIFICATION_SECRET)

const registerModel = new RegisterModel(
  db,
  passwordHashHandler,
  tokenSignHandler,
  sendEmail
)
const handleRegister = registerUser(registerModel)
const registerController = new RegisterController(handleRegister)

registerRouter.post("/", registerController.register)

export default registerRouter