export class User {
  readonly id: string
  readonly email: string
  displayName: string
  readonly createdAt: Date

  constructor(id: string, email: string, displayName: string, createdAt: Date = new Date()) {
    this.id = id
    this.email = email
    this.displayName = displayName
    this.createdAt = createdAt
  }

  get initials(): string {
    const parts = this.displayName.trim().split(/\s+/).filter(Boolean)

    let letters: string
    if (parts.length >= 2) {
      letters = `${parts[0][0]}${parts[parts.length - 1][0]}`
    } else {
      const name = parts[0] ?? "?"
      letters = name.length >= 2 ? name.slice(0, 2) : `${name[0]}${name[0]}`
    }

    return letters.toUpperCase().slice(0, 2)
  }
}
