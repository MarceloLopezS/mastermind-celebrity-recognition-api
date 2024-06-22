import { Router } from "express"
import fs from "fs"
import { ClarifaiStub, grpc } from "clarifai-nodejs-grpc"
import getDetectionData from "../usecases/getDetectionData.js"
import { DetectionModel } from "../adapters/models/detection.js"
import { DetectionController } from "../adapters/controllers/detection.js"

const faceDetectionRouter = Router()

const detectionModel = new DetectionModel(ClarifaiStub, grpc)
const getDetectionDataHandler = getDetectionData(detectionModel)
const detectionController =
  new DetectionController(fs, getDetectionDataHandler)

faceDetectionRouter.post("/", detectionController.getData)

export default faceDetectionRouter