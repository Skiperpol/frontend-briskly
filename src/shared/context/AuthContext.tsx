import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react"

import type { AuthSession } from "@/domain/models/AuthSession"
import { AuthService } from "@/domain/services"

type AuthContextValue = {
  session: AuthSession | null
  isAuthenticated: boolean
  login: (email: string, password: string) => void
  register: (displayName: string, email: string, password: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

let listeners: Array<() => void> = []

function subscribe(listener: () => void) {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

function notify() {
  listeners.forEach((listener) => listener())
}

function getSnapshot(): AuthSession | null {
  return AuthService.getInstance().getSession()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(subscribe, getSnapshot, () => null)

  const login = useCallback((email: string, password: string) => {
    AuthService.getInstance().login(email, password)
    notify()
  }, [])

  const register = useCallback(
    (displayName: string, email: string, password: string) => {
      AuthService.getInstance().register(displayName, email, password)
      notify()
    },
    [],
  )

  const logout = useCallback(() => {
    AuthService.getInstance().logout()
    notify()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      login,
      register,
      logout,
    }),
    [session, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
