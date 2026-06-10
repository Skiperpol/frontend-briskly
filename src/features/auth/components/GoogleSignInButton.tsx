import { GoogleOAuthProvider, useGoogleOAuth } from "@react-oauth/google"
import { Loader2 } from "lucide-react"
import { useEffect, useLayoutEffect, useRef } from "react"

import { getGoogleOAuthOriginMismatchHelp } from "@/shared/config/oauthConfig"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

type GoogleSignInButtonProps = {
  clientId: string
  loading: boolean
  disabled: boolean
  onCredential: (idToken: string) => void
  onError: (message: string) => void
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function GoogleSignInButtonInner({
  loading,
  disabled,
  onCredential,
  onError,
}: Omit<GoogleSignInButtonProps, "clientId">) {
  const visualRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth()
  const initializedRef = useRef(false)
  const onCredentialRef = useRef(onCredential)
  const onErrorRef = useRef(onError)

  onCredentialRef.current = onCredential
  onErrorRef.current = onError

  useEffect(() => {
    if (!scriptLoadedSuccessfully || initializedRef.current || !window.google?.accounts?.id) {
      return
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (!response.credential) {
          onErrorRef.current("Google nie zwróciło tokenu logowania.")
          return
        }
        onCredentialRef.current(response.credential)
      },
    })
    initializedRef.current = true
  }, [clientId, scriptLoadedSuccessfully])

  useLayoutEffect(() => {
    if (!scriptLoadedSuccessfully || !overlayRef.current || !visualRef.current) return
    if (!window.google?.accounts?.id) return

    const render = () => {
      const overlay = overlayRef.current
      const visual = visualRef.current
      if (!overlay || !visual) return

      const width = Math.min(400, Math.floor(visual.getBoundingClientRect().width))
      if (width < 120) return

      overlay.innerHTML = ""
      window.google!.accounts.id.renderButton(overlay, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width,
      })
    }

    render()

    const observer = new ResizeObserver(render)
    observer.observe(visualRef.current)
    return () => observer.disconnect()
  }, [scriptLoadedSuccessfully])

  return (
    <div ref={visualRef} className="relative w-full">
      <Button
        type="button"
        variant="outline"
        className={cn("w-full gap-2", (loading || disabled) && "pointer-events-none")}
        disabled={loading || disabled}
        tabIndex={-1}
        aria-hidden
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <GoogleIcon className="size-4 shrink-0" />
        )}
        Kontynuuj z Google
      </Button>
      <div
        ref={overlayRef}
        className={cn(
          "absolute inset-0 z-10 overflow-hidden opacity-[0.001]",
          (loading || disabled) && "pointer-events-none",
        )}
        aria-label="Kontynuuj z Google"
      />
    </div>
  )
}

export function GoogleSignInButton({
  clientId,
  loading,
  disabled,
  onCredential,
  onError,
}: GoogleSignInButtonProps) {
  return (
    <GoogleOAuthProvider
      clientId={clientId}
      onScriptLoadError={() => {
        onError(
          "Nie udało się załadować skryptu Google. Sprawdź połączenie lub konfigurację OAuth.",
        )
      }}
    >
      <GoogleSignInButtonInner
        loading={loading}
        disabled={disabled}
        onCredential={onCredential}
        onError={(message) => {
          onError(
            message.toLowerCase().includes("origin") ||
              message.toLowerCase().includes("client")
              ? getGoogleOAuthOriginMismatchHelp()
              : message,
          )
        }}
      />
    </GoogleOAuthProvider>
  )
}
