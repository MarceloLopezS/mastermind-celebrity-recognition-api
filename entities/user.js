class User {
  #name
  #entries
  #joined

  constructor(
    { name, email }
  ) {
    this.#name = name
    this.email = email
  }

  get name() {
    return this.#name || null
  }

  setUserName(name) {
    if (typeof name !== "string") {
      throw new TypeError("Username must be a string.")
    }

    this.#name = name
  }

  get entries() {
    return this.#entries || 0
  }

  setEntriesCount(count) {
    if (isNaN(count)) {
      throw new Error(
        "Entries count must be a number equal or greater than 0."
      )
    }

    this.#entries = count
  }

  get joined() {
    return this.#joined || null
  }

  setJoinedTimestamp(timestamp) {
    if (isNaN(timestamp)) {
      throw new Error("Timestamp required to set a join date.")
    }

    this.#joined = timestamp
  }
}

export default User