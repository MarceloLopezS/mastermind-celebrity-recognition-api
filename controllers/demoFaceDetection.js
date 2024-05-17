import { readFile } from "fs/promises"
import asyncHandler from "express-async-handler"

const DEMO_JSON_FOLDER = "../assets/demo_detection_data"

const demoFaceDetection = asyncHandler(async (req, res) => {
  const demoId = req.params.demoId

  try {
    const filePath = new URL(
      `${DEMO_JSON_FOLDER}/demo_${demoId}.json`, import.meta.url
    )
    const demoDetectionData = await readFile(filePath, { encoding: "utf-8" })

    return res.status(200).json(JSON.parse(demoDetectionData))
  } catch (err) {
    throw new Error("Unable to read demo JSON file.")
  }
})

export default demoFaceDetection