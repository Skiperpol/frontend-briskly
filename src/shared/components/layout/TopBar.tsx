import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { LogOut, Settings } from "lucide-react"

import { useAuth } from "@/shared/context/AuthContext"
import { UserAvatar } from "@/shared/components/UserAvatar"
import { Button } from "@/shared/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"
import { cn } from "@/shared/lib/utils"

type TopBarProps = {
  title?: string
  subtitle?: string
  action?: ReactNode
}

export function TopBar({ title, subtitle, action }: TopBarProps) {
  const { session, logout } = useAuth()

  return (
    <header className="flex w-full shrink-0 items-center justify-between gap-4 border-b border-border bg-sidebar px-6 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {(title || subtitle) && (
          <div className="min-w-0">
            {title && <h1 className="truncate text-sm font-semibold">{title}</h1>}
            {subtitle && (
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {action}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Link
          to="/settings"
          className="rounded-lg p-2 text-muted-foreground hover:bg-sidebar-accent"
          aria-label="Ustawienia"
        >
          <Settings className="size-4" />
        </Link>
        {session && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Konto użytkownika"
                className={cn(
                  "rounded-full outline-none transition-opacity",
                  "hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring",
                  "data-[state=open]:ring-2 data-[state=open]:ring-ring",
                )}
              >
                <UserAvatar initials={session.user.initials} className="size-8" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="end"
              sideOffset={8}
              className="w-40 gap-0 p-1.5 shadow-lg"
            >
              <Button
                type="button"
                variant="ghost"
                className="h-9 w-full justify-start gap-2 px-2.5 text-sm font-normal text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => logout()}
              >
                <LogOut className="size-4" />
                Wyloguj
              </Button>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </header>
  )
}
