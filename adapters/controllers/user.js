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