import { Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { AuthError } from "@/domain/services"
import { consumeGithubOAuthState } from "@/shared/config/oauthConfig"
import { useAuth } from "@/shared/context/AuthContext"
import { Button } from "@/shared/components/ui/button"

function getProviderError(searchParams: URLSearchParams): string | null {
  const providerError = searchParams.get("error_description") ?? searchParams.get("error")
  if (!providerError) return null
  return decodeURIComponent(providerError)
}

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithGithub } = useAuth()
  const [asyncError, setAsyncError] = useState<string | null>(null)
  const startedRef = useRef(false)

  const providerError = getProviderError(searchParams)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const missingAuthParams = !providerError && (!code || !state)

  useEffect(() => {
    if (providerError || missingAuthParams || startedRef.current) return
    startedRef.current = true

    const { state: savedState, redirectTo } = consumeGithubOAuthState()
    if (!savedState || state !== savedState) {
      void Promise.resolve().then(() => {
        setAsyncError("Nieprawidłowy stan logowania. Spróbuj ponownie.")
      })
      return
    }

    loginWithGithub(code!)
      .then(() => {
        navigate(redirectTo, { replace: true })
      })
      .catch((err) => {
        setAsyncError(
          err instanceof AuthError ? err.message : "Logowanie przez GitHub nie powiodło się.",
        )
      })
  }, [code, loginWithGithub, missingAuthParams, navigate, providerError, state])

  const error =
    providerError ??
    (missingAuthParams ? "Brak kodu autoryzacji GitHub." : null) ??
    asyncError

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="max-w-md text-sm text-destructive">{error}</p>
        <Button asChild>
          <Link to="/auth">Wróć do logowania</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
      <p>Logowanie przez GitHub…</p>
    </div>
  )
}
