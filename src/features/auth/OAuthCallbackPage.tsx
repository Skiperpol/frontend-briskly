import { Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { AuthError } from "@/domain/services"
import { consumeGithubOAuthState } from "@/shared/config/oauthConfig"
import { useAuth } from "@/shared/context/AuthContext"
import { Button } from "@/shared/components/ui/button"

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithGithub } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const providerError = searchParams.get("error_description") ?? searchParams.get("error")

    if (providerError) {
      setError(decodeURIComponent(providerError))
      return
    }

    if (!code || !state) {
      setError("Brak kodu autoryzacji GitHub.")
      return
    }

    const { state: savedState, redirectTo } = consumeGithubOAuthState()
    if (!savedState || state !== savedState) {
      setError("Nieprawidłowy stan logowania. Spróbuj ponownie.")
      return
    }

    loginWithGithub(code)
      .then(() => {
        navigate(redirectTo, { replace: true })
      })
      .catch((err) => {
        setError(err instanceof AuthError ? err.message : "Logowanie przez GitHub nie powiodło się.")
      })
  }, [loginWithGithub, navigate, searchParams])

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
