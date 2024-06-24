export class UserInfoController {
  #getUserInfo

  constructor(getUserInfoHandler) {
    this.#getUserInfo = getUserInfoHandler
  }

  get = async (req, res) => {
    if (!req?.authorizedUser) {
      return res.status(401).json({
        status: "unauthorized"
      })
    }

    try {
      const email = req.authorizedUser
      const result = await this.#getUserInfo({ email })

      if (result.status !== "success") {
        res.status(result.statusCode).json({
          status: result.status
        })
      } else {
        res.status(result.statusCode).json({
          status: result.status,
          userInfo: result.userInfo
        })
      }
    } catch (err) {
      console.log(err)
      return res.status(502).json({
        status: "fail"
      })
    }
  }
}

export class UserEntriesController {
  #incrementDetectionEntry

  constructor(incrementDetectionEntryHandler) {
    this.#incrementDetectionEntry = incrementDetectionEntryHandler
  }

  incrementDetectionEntry = async (req, res) => {
    if (!req.authorizedUser) {
      return res.status(403).json({
        status: "unauthorized"
      })
    }

    try {
      const email = req.authorizedUser
      const result = await this.#incrementDetectionEntry({ email })

      if (result.status !== "success") {
        res.status(result.statusCode).json({
          status: result.status
        })
      } else {
        res.status(result.statusCode).json({
          status: result.status
        })
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        status: "fail",
        fail: {
          message: "There was a problem incrementing user entries."
        }
      })
    }
  }
}