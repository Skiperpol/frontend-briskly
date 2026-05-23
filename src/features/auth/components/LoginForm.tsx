import { useState, type FormEvent } from "react"
import { Loader2 } from "lucide-react"

import { AuthError } from "@/domain/services"
import { useAuth } from "@/shared/context/AuthContext"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"

type LoginFormProps = {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth()
  const [email, setEmail] = useState("demo@briskly.app")
  const [password, setPassword] = useState("demo1234")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      login(email, password)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Logowanie nie powiodło się.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">E-mail</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="twoj@email.pl"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Hasło</Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : "Zaloguj się"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Konto demo: <span className="font-medium">demo@briskly.app</span> /{" "}
        <span className="font-medium">demo1234</span>
      </p>
    </form>
  )
}
