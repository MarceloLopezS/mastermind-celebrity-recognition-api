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

export class DetectionModel {
  #stub
  #grpc

  constructor(ClarifaiStub, grpc) {
    this.#stub = ClarifaiStub
    this.#grpc = grpc
  }

  getData = async (imageUrl, Detection) => {

    const stub = this.#stub.grpc()
    const metadata = new this.#grpc.Metadata()

    metadata.set("authorization", `Key ${process.env.PAT}`)
    const dataPromise = new Promise((resolve, reject) => {
      stub.PostModelOutputs(
        {
          user_app_id: {
            user_id: process.env.USER_ID,
            app_id: process.env.APP_ID
          },
          model_id: process.env.MODEL_ID,
          inputs: [{ data: { image: { url: imageUrl } } }]
        },
        metadata,
        (err, response) => {
          if (err) {
            return reject(new Error(err))
          }

          if (response.status.code !== 10000) {
            return reject(new Error(
              "Post model outputs failed: "
              + response.outputs[0].status.description
              + "\n"
              + response.outputs[0].status.details
            ))
          }

          const rawRegions = response.outputs[0].data

          const regions = rawRegions.map(region => {
            const detection = new Detection()
            const boundingBox = region.region_info.bounding_box
            const faceDetection = {
              name: region.data.concepts[0].name,
              probability: region.data.concepts[0].value
            }

            detection.setBoundingBox(boundingBox)
            detection.setFaceDetection(faceDetection)

            return detection.data
          })

          resolve({ status: "success", statusCode: 200, regions })
        }
      )
    })

    return await dataPromise
  }
}