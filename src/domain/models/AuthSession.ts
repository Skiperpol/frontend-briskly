import type { User } from "./User"

export class AuthSession {
  readonly user: User
  readonly token: string
  readonly expiresAt: Date

  constructor(user: User, token: string, expiresAt: Date) {
    this.user = user
    this.token = token
    this.expiresAt = expiresAt
  }

  get isExpired(): boolean {
    return Date.now() > this.expiresAt.getTime()
  }
}
