export const stringDateToTimestamp = stringDate => {
  return new Date(stringDate).getTime()
}

export const isValidEmail = (string) => {
  if (typeof string !== "string") {
    throw new TypeError("Email must be a string.")
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

  return string.match(emailRegex)
}