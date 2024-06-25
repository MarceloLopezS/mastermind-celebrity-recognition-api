import { Router } from "express"
import fs from "fs"
import multer from "multer"
import crypto from "crypto"
import db from "../database/db.js"
import { ClarifaiStub, grpc } from "clarifai-nodejs-grpc"
import getDetectionData from "../usecases/getDetectionData.js"
import { DetectionModel } from "../adapters/models/detection.js"
import { DetectionController } from "../adapters/controllers/detection.js"
import incrementDetectionEntry from "../usecases/incrementDetectionEntry.js"
import { UserEntriesModel } from "../adapters/models/user.js"
import { UserEntriesController } from "../adapters/controllers/user.js"

const faceDetectionRouter = Router()

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./uploads")
  },
  filename: (req, file, callback) => {
    const filename = crypto.randomBytes(16).toString("hex")
    const fileOriginalExtension = file.originalname.split(".").at(-1)
    callback(null, `${filename}.${fileOriginalExtension}`)
  }
})
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads")
}
const upload = multer({ storage })

const detectionModel = new DetectionModel(ClarifaiStub, grpc)
const getDetectionDataHandler = getDetectionData(detectionModel)
const detectionController =
  new DetectionController(fs, getDetectionDataHandler)

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