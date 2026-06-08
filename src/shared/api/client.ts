import { AuthError } from "@/domain/services/AuthService"

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api"

type StoredTokens = {
  access: string
  refresh: string
  accessExpiresAt: string
}

const TOKEN_KEY = "briskly_auth_tokens"

export class ApiError extends Error {
  readonly status: number
  readonly payload: unknown

  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.payload = payload
  }
}

function loadTokens(): StoredTokens | null {
  const raw = localStorage.getItem(TOKEN_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredTokens
  } catch {
    return null
  }
}

export function saveTokens(access: string, refresh: string, accessMinutes = 15): void {
  const accessExpiresAt = new Date(Date.now() + accessMinutes * 60 * 1000).toISOString()
  const payload: StoredTokens = { access, refresh, accessExpiresAt }
  localStorage.setItem(TOKEN_KEY, JSON.stringify(payload))
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getAccessToken(): string | null {
  return loadTokens()?.access ?? null
}

async function refreshAccessToken(): Promise<string | null> {
  const tokens = loadTokens()
  if (!tokens?.refresh) return null

  const response = await fetch(`${API_BASE}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: tokens.refresh }),
  })

  if (!response.ok) {
    clearTokens()
    return null
  }

  const data = (await response.json()) as { access: string; refresh?: string }
  saveTokens(data.access, data.refresh ?? tokens.refresh)
  return data.access
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "object" && payload !== null) {
    if ("error" in payload && typeof payload.error === "string") {
      return payload.error
    }
    if ("detail" in payload && typeof payload.detail === "string") {
      return payload.detail
    }
    if ("username" in payload && Array.isArray(payload.username)) {
      return String(payload.username[0])
    }
    if ("email" in payload && Array.isArray(payload.email)) {
      return String(payload.email[0])
    }
    if ("display_name" in payload && Array.isArray(payload.display_name)) {
      return String(payload.display_name[0])
    }
  }
  return fallback
}

export async function apiDownload(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<Blob> {
  const headers = new Headers(options.headers)
  const token = getAccessToken()
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401 && retry && getAccessToken()) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      return apiDownload(path, options, false)
    }
    throw new AuthError("Sesja wygasła — zaloguj się ponownie.")
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new ApiError(
      extractErrorMessage(payload, `Błąd API (${response.status})`),
      response.status,
      payload,
    )
  }

  return response.blob()
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  const token = getAccessToken()
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401 && retry && getAccessToken()) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      return apiRequest<T>(path, options, false)
    }
    throw new AuthError("Sesja wygasła — zaloguj się ponownie.")
  }

  if (response.status === 204) {
    return undefined as T
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(payload, `Błąd API (${response.status})`),
      response.status,
      payload,
    )
  }

  return payload as T
}
