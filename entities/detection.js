class Detection {
  #boundingBox
  #faceDetection

  setBoundingBox = ({ top_row, left_col, bottom_row, right_col }) => {
    if (
      isNaN(top_row)
      || isNaN(left_col)
      || isNaN(bottom_row)
      || isNaN(right_col)
    ) {
      throw new TypeError("Bounding box coordinates must be numbers.")
    }

    this.#boundingBox = { top_row, left_col, bottom_row, right_col }
  }

  setFaceDetection = ({ name, probability }) => {
    if (typeof name !== "string") {
      throw new TypeError("Model detection name must be a string.")
    }

    if (isNaN(probability)) {
      throw new TypeError("Model detection probability must be a number")
    }

    this.#faceDetection = { name, probability }
  }

  get data() {
    return {
      boundingBox: this.#boundingBox,
      faceDetection: this.#faceDetection
    }
  }
}

export default Detection