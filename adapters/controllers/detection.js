export class DemoDetectionController {
  #getDemoData

  constructor(getDemoDataHandler) {
    this.#getDemoData = getDemoDataHandler
  }

  getData = async (req, res) => {
    const { demoId } = req.body

    try {
      const DEMO_JSON_FOLDER = "../../assets/demo_detection_data"
      const fileUrl = new URL(
        `${DEMO_JSON_FOLDER}/demo_${demoId}.json`, import.meta.url
      )

      const result =
        await this.#getDemoData({ fileUrl, encoding: "utf-8" })

      if (result.status === "success") {
        res.status(result.statusCode).json({
          status: result.status,
          detectionData: result.regions
        })
      }
    } catch (err) {
      console.log(err)
      res.status(502).json({
        status: "fail",
        fail: {
          message:
            "There was a problem processing the detection data."
        }
      })
    }
  }
}

export class DetectionController {
  #getDetectionData

  constructor(getDetectionDataHandler) {
    this.#getDetectionData = getDetectionDataHandler
  }

  getData = async (req, res) => {
    if (!req.authorizedUser) {
      req.file.buffer = null

      return res.status(403).json({
        status: "unauthorized"
      })
    }

    try {
      const image = req.file.buffer

      const result = await this.#getDetectionData(image)

      if (result.status === "success") {
        res.status(result.statusCode).json({
          status: result.status,
          detectionData: result.regions
        })
      }
    } catch (err) {
      console.log(err)
      res.status(500).json({
        status: "fail",
        fail: {
          message: "There was an issue processing the detection data."
        }
      })
    } finally {
      req.file.buffer = null
    }
  }
}