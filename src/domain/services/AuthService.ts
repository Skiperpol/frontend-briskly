import { AuthSession } from "@/domain/models/AuthSession"
import { User } from "@/domain/models/User"
import {
  fetchCurrentUser,
  loginWithPassword,
  patchCurrentUser,
  registerUser,
} from "@/shared/api/authApi"
import { clearTokens, getAccessToken } from "@/shared/api/client"
import { mapApiUser } from "@/shared/api/mappers"

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AuthError"
  }
}

export class AuthService {
  private static instance: AuthService | null = null

  private session: AuthSession | null = null
  private initialized = false
  private initPromise: Promise<void> | null = null

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async initialize(): Promise<void> {
    if (this.initialized) return
    if (this.initPromise) {
      await this.initPromise
      return
    }

    this.initPromise = this.restoreSession()
    await this.initPromise
    this.initPromise = null
    this.initialized = true
  }

  getSession(): AuthSession | null {
    if (this.session?.isExpired) {
      this.logout()
      return null
    }
    return this.session
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null
  }

  async login(email: string, password: string): Promise<AuthSession> {
    const username = email.trim()
    const data = await loginWithPassword(username, password)
    const user = mapApiUser(data.user)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
    this.session = new AuthSession(user, data.access, expiresAt)
    return this.session
  }

  async register(displayName: string, email: string, password: string): Promise<AuthSession> {
    if (!displayName.trim()) {
      throw new AuthError("Podaj imię i nazwisko.")
    }
    if (!email.trim().includes("@")) {
      throw new AuthError("Podaj poprawny adres e-mail.")
    }
    if (password.length < 8) {
      throw new AuthError("Hasło musi mieć co najmniej 8 znaków.")
    }

    const data = await registerUser(displayName.trim(), email.trim().toLowerCase(), password)
    const user = mapApiUser(data.user)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
    this.session = new AuthSession(user, data.access, expiresAt)
    return this.session
  }

  logout(): void {
    this.session = null
    clearTokens()
  }

  async updateDisplayName(displayName: string): Promise<User> {
    const session = this.getSession()
    if (!session) {
      throw new AuthError("Brak aktywnej sesji.")
    }

    const trimmed = displayName.trim()
    if (!trimmed) {
      throw new AuthError("Podaj imię i nazwisko.")
    }

    const apiUser = await patchCurrentUser({ display_name: trimmed })
    const user = mapApiUser(apiUser)
    this.session = new AuthSession(user, session.token, session.expiresAt)
    return user
  }

  private async restoreSession(): Promise<void> {
    if (!getAccessToken()) return

    try {
      const apiUser = await fetchCurrentUser()
      const token = getAccessToken()
      if (!token) return

      const user = mapApiUser(apiUser)
      this.session = new AuthSession(user, token, new Date(Date.now() + 15 * 60 * 1000))
    } catch {
      this.logout()
    }
  }
}
