import { Router } from "express"
import multer from "multer"
import db from "../database/db.js"
import { ClarifaiStub, grpc } from "clarifai-nodejs-grpc"
import getDetectionData from "../usecases/getDetectionData.js"
import { DetectionModel } from "../adapters/models/detection.js"
import { DetectionController } from "../adapters/controllers/detection.js"
import incrementDetectionEntry from "../usecases/incrementDetectionEntry.js"
import { UserEntriesModel } from "../adapters/models/user.js"
import { UserEntriesController } from "../adapters/controllers/user.js"

const faceDetectionRouter = Router()

const storage = multer.memoryStorage()
const upload = multer({ storage })

const detectionModel = new DetectionModel(ClarifaiStub, grpc)
const getDetectionDataHandler = getDetectionData(detectionModel)
const detectionController =
  new DetectionController(getDetectionDataHandler)

const userEntriesModel = new UserEntriesModel(db)
const incrementDetectionEntryHandler =
  incrementDetectionEntry(userEntriesModel)
const userEntriesController = new UserEntriesController(
  incrementDetectionEntryHandler
)

faceDetectionRouter.post(
  "/",
  upload.single("image-input"),
  detectionController.getData
)
faceDetectionRouter.put(
  "/increment-entry",
  userEntriesController.incrementDetectionEntry
)

export default faceDetectionRouter