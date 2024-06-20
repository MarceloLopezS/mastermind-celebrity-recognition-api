import { Router } from "express"
import db from "../database/db.js"
import getUserInfo from "../usecases/getUserInfo.js"
import { UserInfoModel } from "../adapters/models/user.js"
import { UserInfoController } from "../adapters/controllers/user.js"

const userInfoRouter = Router()

const userInfoModel = new UserInfoModel(db)
const getUserInfoHandler = getUserInfo(userInfoModel)
const userInfoController = new UserInfoController(getUserInfoHandler)

userInfoRouter.get("/", userInfoController.get)

export default userInfoRouter