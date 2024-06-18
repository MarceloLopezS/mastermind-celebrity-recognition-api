import { Router } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import db from "../database/db.js"
import loginUser from "../usecases/loginUser.js"
import { LoginModel } from "../adapters/models/session.js"
import { LoginController } from "../adapters/controllers/session.js"

const loginRouter = Router()

const hashComparisonHandler = (data, hash) => bcrypt.compare(data, hash)
const tokenSignHandler = (token) =>
  jwt.sign(token, process.env.TOKEN_ACCESS_SECRET)
const loginModel =
  new LoginModel(db, hashComparisonHandler, tokenSignHandler)
const handleLogin = loginUser(loginModel)
const loginController = new LoginController(handleLogin)

loginRouter.post("/", loginController.login)

export default loginRouter