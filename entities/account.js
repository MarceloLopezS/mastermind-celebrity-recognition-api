class Account {
  #activation
  #expiration

  constructor(
    { email, password }
  ) {
    this.email = email
    this.password = password
  }

  get activation() {
    return this.#activation || null
  }

  setActivation = (value) => {
    if (!typeof value === "string") {
      throw new Error("Activation value must be a token or 'active'.")
    }

    this.#activation = value
  }

  get expiration() {
    return this.#expiration || null
  }

  setExpiration = (timestamp) => {
    if (isNaN(timestamp)) {
      throw new Error(
        "Expiration value must be a number representing the timestamp."
      )
    }

    this.expiration = timestamp
  }
}

export default Account