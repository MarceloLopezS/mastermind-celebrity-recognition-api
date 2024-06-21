export class DemoDetectionModel {
  #readFile

  constructor(readFileHandler) {
    this.#readFile = readFileHandler
  }

  getData = async ({ fileUrl, encoding }, Detection) => {
    const fileContent = await this.#readFile(fileUrl, { encoding })
    const demo = JSON.parse(fileContent)
    const demoRegions = demo.regions

    const regions = demoRegions.map(region => {
      const detection = new Detection()

      detection.setBoundingBox(region.boundingBox)
      detection.setFaceDetection(region.faceDetection)

      return detection.data
    })

    return {
      status: "success",
      statusCode: 200,
      regions
    }
  }
}