import { Router } from "express"
import { AuthCheckController } from "../adapters/controllers/session.js"

const checkUserAuthenticationRouter = Router()

const authCheckController = new AuthCheckController()

checkUserAuthenticationRouter.get(
  "/",
  authCheckController.checkAuth
)

export default checkUserAuthenticationRouter