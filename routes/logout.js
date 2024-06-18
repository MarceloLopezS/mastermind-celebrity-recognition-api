import { Router } from "express"
import { LogoutController } from "../adapters/controllers/session.js"

const logoutRouter = Router()
const logoutController = new LogoutController()

logoutRouter.post("/", logoutController.logout)

export default logoutRouter