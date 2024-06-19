class RecoveryEmail {
  #email

  constructor({ email }) {
    this.#email = email
  }

  get email() {
    return this.#email || null
  }
}

export default RecoveryEmail