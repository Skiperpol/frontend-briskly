export class User {
  readonly id: string
  readonly email: string
  readonly displayName: string
  readonly createdAt: Date

  constructor(id: string, email: string, displayName: string, createdAt: Date = new Date()) {
    this.id = id
    this.email = email
    this.displayName = displayName
    this.createdAt = createdAt
  }

  get initials(): string {
    return this.displayName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }
}
