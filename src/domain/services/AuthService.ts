import { AuthSession } from "@/domain/models/AuthSession"
import { User } from "@/domain/models/User"

const STORAGE_KEY = "briskly_auth_session"

type StoredCredential = {
  user: User
  password: string
}

type StoredSession = {
  userId: string
  token: string
  expiresAt: string
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AuthError"
  }
}

export class AuthService {
  private static instance: AuthService | null = null

  private session: AuthSession | null = null
  private readonly credentials = new Map<string, StoredCredential>()

  private constructor() {
    this.seedDemoUser()
    this.restoreSession()
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
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

  login(email: string, password: string): AuthSession {
    const normalized = email.trim().toLowerCase()
    const record = this.credentials.get(normalized)

    if (!record || record.password !== password) {
      throw new AuthError("Nieprawidłowy e-mail lub hasło.")
    }

    return this.openSession(record.user)
  }

  register(displayName: string, email: string, password: string): AuthSession {
    const normalized = email.trim().toLowerCase()

    if (!displayName.trim()) {
      throw new AuthError("Podaj imię i nazwisko.")
    }
    if (!normalized.includes("@")) {
      throw new AuthError("Podaj poprawny adres e-mail.")
    }
    if (password.length < 8) {
      throw new AuthError("Hasło musi mieć co najmniej 8 znaków.")
    }
    if (this.credentials.has(normalized)) {
      throw new AuthError("Konto z tym adresem e-mail już istnieje.")
    }

    const user = new User(crypto.randomUUID(), normalized, displayName.trim())
    this.credentials.set(normalized, { user, password })

    return this.openSession(user)
  }

  logout(): void {
    this.session = null
    localStorage.removeItem(STORAGE_KEY)
  }

  private openSession(user: User): AuthSession {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const token = crypto.randomUUID()
    this.session = new AuthSession(user, token, expiresAt)
    this.persistSession()
    return this.session
  }

  private persistSession(): void {
    if (!this.session) return

    const payload: StoredSession = {
      userId: this.session.user.id,
      token: this.session.token,
      expiresAt: this.session.expiresAt.toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  private restoreSession(): void {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    try {
      const payload = JSON.parse(raw) as StoredSession
      const user = this.findUserById(payload.userId)
      if (!user) {
        this.logout()
        return
      }

      const session = new AuthSession(
        user,
        payload.token,
        new Date(payload.expiresAt),
      )

      if (session.isExpired) {
        this.logout()
        return
      }

      this.session = session
    } catch {
      this.logout()
    }
  }

  private findUserById(userId: string): User | undefined {
    for (const record of this.credentials.values()) {
      if (record.user.id === userId) {
        return record.user
      }
    }
    return undefined
  }

  private seedDemoUser(): void {
    const email = "demo@briskly.app"
    if (this.credentials.has(email)) return

    const user = new User("demo-user", email, "Alex Rivera")
    this.credentials.set(email, { user, password: "demo1234" })
  }
}
