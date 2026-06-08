import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"

import type { AuthSession } from "@/domain/models/AuthSession"
import { AuthService } from "@/domain/services"

type AuthContextValue = {
  session: AuthSession | null
  isAuthenticated: boolean
  isReady: boolean
  login: (email: string, password: string) => Promise<void>
  register: (displayName: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateDisplayName: (displayName: string) => Promise<void>
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
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    AuthService.getInstance()
      .initialize()
      .then(() => {
        notify()
        setIsReady(true)
      })
      .catch(() => {
        setIsReady(true)
      })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    await AuthService.getInstance().login(email, password)
    notify()
  }, [])

  const register = useCallback(
    async (displayName: string, email: string, password: string) => {
      await AuthService.getInstance().register(displayName, email, password)
      notify()
    },
    [],
  )

  const logout = useCallback(() => {
    AuthService.getInstance().logout()
    notify()
  }, [])

  const updateDisplayName = useCallback(async (displayName: string) => {
    await AuthService.getInstance().updateDisplayName(displayName)
    notify()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      isReady,
      login,
      register,
      logout,
      updateDisplayName,
    }),
    [session, isReady, login, register, logout, updateDisplayName],
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
