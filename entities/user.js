class User {
  constructor(
    { name, email, password, entries, joined, activation, expiration }
  ) {
    this.name = name
    this.email = email
    this.entries = entries
    this.joined = joined
    this.password = password
    this.activation = activation
    this.expiration = expiration
  }
}

export default User