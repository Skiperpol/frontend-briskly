import { useState } from "react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { Compass, Mail } from "lucide-react"

import { LoginForm } from "@/features/auth/components/LoginForm"
import { RegisterForm } from "@/features/auth/components/RegisterForm"
import { useAuth } from "@/shared/context/AuthContext"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

type AuthTab = "login" | "register"

export function AuthPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [tab, setTab] = useState<AuthTab>("login")

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? "/"

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  function handleSuccess() {
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="flex min-h-screen">
      <section className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-foreground/80" />
        <div className="relative z-10 p-10 text-white">
          <div className="flex items-center gap-2">
            <Compass className="size-8" />
            <div>
              <p className="text-2xl font-bold">Briskly</p>
              <p className="text-xs uppercase tracking-wider opacity-80">
              Planuj, podróżuj, <br />wspominaj
              </p>
            </div>
          </div>
        </div>
        <div className="relative z-10 max-w-md p-10 text-white">
          <h1 className="text-3xl font-bold leading-tight">
            Planuj trasy<br />Zbieraj wspomnienia
          </h1>
          <p className="mt-3 text-sm leading-relaxed opacity-90">
            Logistyka wieloetapowych podróży, sugestie destynacji i dziennik
            zsynchronizowany z planem wycieczki w jednym miejscu.
          </p>
        </div>
      </section>

      <section className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <p className="text-2xl font-bold">Briskly</p>
            <p className="text-sm text-muted-foreground">Planuj, podróżuj, <br />wspominaj</p>
          </div>

          <h2 className="text-xl font-semibold">
            {tab === "login" ? "Zaloguj się" : "Utwórz konto"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === "login"
              ? "Wejdź do swoich planów i archiwum podróży."
              : "Dołącz do Briskly i zacznij planować pierwszą wycieczkę."}
          </p>

          <div className="mt-6 flex rounded-lg border border-border p-1">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={cn(
                "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                tab === "login"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Logowanie
            </button>
            <button
              type="button"
              onClick={() => setTab("register")}
              className={cn(
                "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                tab === "register"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Rejestracja
            </button>
          </div>

          <div className="mt-6">
            {tab === "login" ? (
              <LoginForm onSuccess={handleSuccess} />
            ) : (
              <RegisterForm onSuccess={handleSuccess} />
            )}
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">lub</span>
            </div>
          </div>

          <Button variant="outline" className="w-full gap-2" type="button" disabled>
            <Mail className="size-4" />
            Kontynuuj z Google (wkrótce)
          </Button>
        </div>
      </section>
    </div>
  )
}
