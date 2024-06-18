class Credentials {
  #email
  #password

  constructor({ email, password }) {
    this.#email = email
    this.#password = password
  }

  get email() {
    return this.#email || null
  }

  get password() {
    return this.#password || null
  }
}

export default Credentials