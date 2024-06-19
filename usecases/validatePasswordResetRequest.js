import RecoveryEmail from "../entities/recoveryEmail.js"

const validatePasswordResetRequest =
  (passwordResetValidationModel) => async ({ email }) => {
    const recoveryEmail = new RecoveryEmail({ email })

    return await passwordResetValidationModel.validateRequest(
      recoveryEmail
    )
  }

export default validatePasswordResetRequest