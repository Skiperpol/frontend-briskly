import { Loader2 } from "lucide-react"
import { useState } from "react"

import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton"
import { AuthError } from "@/domain/services"
import { useAuth } from "@/shared/context/AuthContext"
import { Button } from "@/shared/components/ui/button"
import {
  getGoogleClientId,
  getGoogleOAuthJavascriptOrigin,
  isGithubOAuthEnabled,
  isGoogleOAuthEnabled,
  startGithubOAuth,
} from "@/shared/config/oauthConfig"

type SocialLoginButtonsProps = {
  redirectTo: string
  onSuccess?: () => void
  onError?: (message: string) => void
}

type LoadingProvider = "google" | "github" | null

export function SocialLoginButtons({
  redirectTo,
  onSuccess,
  onError,
}: SocialLoginButtonsProps) {
  const { loginWithGoogle } = useAuth()
  const [loading, setLoading] = useState<LoadingProvider>(null)

  const googleEnabled = isGoogleOAuthEnabled()
  const githubEnabled = isGithubOAuthEnabled()

  if (!googleEnabled && !githubEnabled) {
    return (
      <p className="text-center text-xs text-muted-foreground">
        Logowanie SSO jest niedostępne. Ustaw{" "}
        <code className="rounded bg-muted px-1 py-0.5">VITE_GOOGLE_CLIENT_ID</code> lub{" "}
        <code className="rounded bg-muted px-1 py-0.5">VITE_GITHUB_CLIENT_ID</code> w pliku{" "}
        <code className="rounded bg-muted px-1 py-0.5">.env</code>.
      </p>
    )
  }

  async function handleGoogleCredential(idToken: string) {
    setLoading("google")
    try {
      await loginWithGoogle(idToken)
      onSuccess?.()
    } catch (err) {
      onError?.(err instanceof AuthError ? err.message : "Logowanie przez Google nie powiodło się.")
    } finally {
      setLoading(null)
    }
  }

  function handleGithubClick() {
    setLoading("github")
    startGithubOAuth(redirectTo)
  }

  return (
    <div className="space-y-3">
      {googleEnabled && (
        <>
          <GoogleSignInButton
            clientId={getGoogleClientId()!}
            loading={loading === "google"}
            disabled={loading !== null}
            onCredential={(idToken) => void handleGoogleCredential(idToken)}
            onError={(message) => onError?.(message)}
          />
          {import.meta.env.DEV && (
            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
              Google OAuth origin:{" "}
              <code className="rounded bg-muted px-1 py-0.5">
                {getGoogleOAuthJavascriptOrigin()}
              </code>
              . Przy błędzie <strong>origin_mismatch</strong> dodaj ten adres w Google Cloud
              Console.
            </p>
          )}
        </>
      )}

      {githubEnabled && (
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          disabled={loading !== null}
          onClick={handleGithubClick}
        >
          {loading === "github" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
              <path
                fill="currentColor"
                d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"
              />
            </svg>
          )}
          Kontynuuj z GitHub
        </Button>
      )}
    </div>
  )
}
