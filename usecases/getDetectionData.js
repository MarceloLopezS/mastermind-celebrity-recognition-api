import Detection from "../entities/detection.js"

const getDetectionData = (detectionModel) => async (imageUrl) => {
  return await detectionModel.getData(imageUrl, Detection)
}

export default getDetectionData