import { Router } from "express"
import { readFile } from "fs/promises"
import asyncHandler from "express-async-handler"
import getDemoDetectionData from "../usecases/getDemoDetectionData.js"
import { DemoDetectionModel } from "../adapters/models/detection.js"
import { DemoDetectionController } from "../adapters/controllers/detection.js"

const demoFaceDetectionRouter = Router()

const demoDetectionModel = new DemoDetectionModel(readFile)
const getDemoDataHandler = getDemoDetectionData(demoDetectionModel)
const demoDetectionController =
  new DemoDetectionController(getDemoDataHandler)

demoFaceDetectionRouter.post(
  "/",
  asyncHandler(demoDetectionController.getData)
)

export default demoFaceDetectionRouter