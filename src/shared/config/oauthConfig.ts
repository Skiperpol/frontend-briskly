const DEFAULT_GITHUB_CALLBACK = `${window.location.origin}/auth/callback/github`

export function getGoogleClientId(): string | null {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()
  return clientId || null
}

export function getGithubClientId(): string | null {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID?.trim()
  return clientId || null
}

export function getGithubOAuthCallbackUrl(): string {
  return import.meta.env.VITE_GITHUB_OAUTH_CALLBACK_URL?.trim() || DEFAULT_GITHUB_CALLBACK
}

export function isGoogleOAuthEnabled(): boolean {
  return getGoogleClientId() !== null
}

export function getGoogleOAuthJavascriptOrigin(): string {
  return window.location.origin
}

export function getGoogleOAuthOriginMismatchHelp(): string {
  const origin = getGoogleOAuthJavascriptOrigin()
  return (
    `Logowanie Google nie działa dla tej domeny (${origin}). ` +
    `W Google Cloud Console → APIs & Services → Credentials → klient OAuth (typ: Web application) ` +
    `dodaj ten adres w „Authorized JavaScript origins”. ` +
    `Uwaga: http://localhost:5173 i http://127.0.0.1:5173 to różne origins — dodaj ten, którego używasz w przeglądarce.`
  )
}

export function isGithubOAuthEnabled(): boolean {
  return getGithubClientId() !== null
}

export function isAnyOAuthEnabled(): boolean {
  return isGoogleOAuthEnabled() || isGithubOAuthEnabled()
}

const GITHUB_STATE_KEY = "briskly_github_oauth_state"
const GITHUB_REDIRECT_KEY = "briskly_github_oauth_redirect"

export function startGithubOAuth(redirectTo: string): void {
  const clientId = getGithubClientId()
  if (!clientId) return

  const state = crypto.randomUUID()
  sessionStorage.setItem(GITHUB_STATE_KEY, state)
  sessionStorage.setItem(GITHUB_REDIRECT_KEY, redirectTo)

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGithubOAuthCallbackUrl(),
    scope: "user:email",
    state,
  })

  window.location.assign(`https://github.com/login/oauth/authorize?${params.toString()}`)
}

export function consumeGithubOAuthState(): {
  state: string | null
  redirectTo: string
} {
  const state = sessionStorage.getItem(GITHUB_STATE_KEY)
  const redirectTo = sessionStorage.getItem(GITHUB_REDIRECT_KEY) ?? "/trasy"
  sessionStorage.removeItem(GITHUB_STATE_KEY)
  sessionStorage.removeItem(GITHUB_REDIRECT_KEY)
  return { state, redirectTo }
}
