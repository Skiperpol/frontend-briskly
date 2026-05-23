import { Settings } from "lucide-react"

import { useAuth } from "@/shared/context/AuthContext"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"

type TopBarProps = {
  title?: string
  subtitle?: string
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const { session } = useAuth()

  return (
    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-6 py-3">
      {(title || subtitle) ? (
        <div className="min-w-0">
          {title && <h1 className="truncate text-sm font-semibold">{title}</h1>}
          {subtitle && (
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      ) : (
        <span />
      )}

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
          aria-label="Ustawienia"
        >
          <Settings className="size-4" />
        </button>
        <Avatar className="size-8">
          <AvatarFallback>{session?.user.initials ?? "?"}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
