import Detection from "../entities/detection.js"

const getDemoDetectionData =
  (demoDetectionModel) => async ({ fileUrl, encoding }) => {

    return await demoDetectionModel.getData(
      { fileUrl, encoding }, Detection
    )
  }

export default getDemoDetectionData