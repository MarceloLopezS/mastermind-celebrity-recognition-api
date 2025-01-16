import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { rateLimit } from "express-rate-limit"
import errorHandler from "./middlewares/errorHandler.js"
import authorizeUser from "./middlewares/authorizeUser.js"
import loginRouter from "./routes/login.js"
import logoutRouter from "./routes/logout.js"
import registerRouter from "./routes/register.js"
import emailVerificationRouter from "./routes/emailVerification.js"
import forgotPasswordRouter from "./routes/forgotPassword.js"
import passwordResetRouter from "./routes/passwordReset.js"
import checkUserAuthenticationRouter from "./routes/checkUserAuthentication.js"
import userInfoRouter from "./routes/userInfo.js"
import demoFaceDetectionRouter from "./routes/demoFaceDetection.js"
import faceDetectionRouter from "./routes/faceDetection.js"

const app = express()

const limiter = rateLimit({
  windowMs: 1000 * 60 * 60 * 12, //12h
  limit: 100,
  message: "You have reached your detection requests limit."
    + " " + "Come back later.",
  keyGenerator: (req, res) => req.authorizedUser,
  handler: (req, res, next, options) => {
    if (req.rateLimit.remaining === 0) {
      res.status(options.statusCode).json({
        status: "ratelimit",
        ratelimit: {
          message: options.message
        }
      })
    } else {
      next()
    }
  }
})
const corsWhitelist = [process.env.APP_FRONT_END_URL]
app.use(
  cors({
    origin: (origin, callback) => {
      if (corsWhitelist.includes(origin) || !origin) callback(null, true)
      else callback(new Error("Not allowed by Cors"))
    },
    credentials: true
  })
)
app.use(cookieParser())
app.use(express.json())

app.get("/", (req, res) => res.status(200).json({ status: "success" }))
app.use("/login", loginRouter)
app.use("/logout", logoutRouter)
app.use("/register", registerRouter)
app.use("/email-verification", emailVerificationRouter)
app.use("/forgot-password", forgotPasswordRouter)
app.use("/password-reset", passwordResetRouter)
app.use("/check-user-authentication",
  authorizeUser,
  checkUserAuthenticationRouter
)
app.use("/user-info", authorizeUser, userInfoRouter)
app.use("/demo-face-detection", demoFaceDetectionRouter)
app.use(
  "/face-detection",
  authorizeUser,
  limiter,
  faceDetectionRouter
)

app.use(errorHandler)

app.listen(process.env.PORT || 3001, () => {
  console.log(`Listening to port ${process.env.PORT || 3001}`)
})
