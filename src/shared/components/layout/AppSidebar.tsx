import { Link, NavLink } from "react-router-dom"
import {
  Compass,
  Globe2,
  LogOut,
  Map,
  Plus,
  Settings,
} from "lucide-react"

import { useAuth } from "@/shared/context/AuthContext"
import { UserAvatar } from "@/shared/components/UserAvatar"
import { Button } from "@/shared/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"
import { cn } from "@/shared/lib/utils"

const navItems = [
  { to: "/planner", label: "Planowanie", icon: Compass, end: false },
  { to: "/trasy", label: "Trasy", icon: Map, end: false },
  { to: "/map", label: "Mapa tras", icon: Globe2, end: true },
] as const

export function AppSidebar() {
  const { session, logout } = useAuth()

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-sidebar px-3 py-5">
      <div className="mb-8 px-2">
        <p className="text-lg font-bold tracking-tight text-foreground">Briskly</p>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Planuj, podróżuj, <br />wspominaj
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="pointer-events-none absolute inset-y-0 right-0 w-1 rounded-r-lg bg-primary"
                    aria-hidden
                  />
                )}
                <Icon className="size-4" />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 space-y-3">
        <Button className="w-full gap-2" asChild>
          <Link to="/planner">
            <Plus className="size-4" />
            Nowa wycieczka
          </Link>
        </Button>

        {session && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-background px-3 py-2.5 text-left transition-colors",
                  "hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "data-[state=open]:bg-sidebar-accent",
                )}
              >
                <UserAvatar
                  initials={session.user.initials}
                  className="size-8"
                  fallbackClassName="text-xs"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">
                    {session.user.displayName}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="start"
              sideOffset={8}
              className="w-[calc(var(--radix-popover-trigger-width))] gap-1 p-1.5 shadow-lg"
            >
              <Button
                type="button"
                variant="ghost"
                className="h-9 w-full justify-start gap-2 px-2.5 text-sm font-normal"
                asChild
              >
                <Link to="/settings">
                  <Settings className="size-4" />
                  Ustawienia
                </Link>
              </Button>
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
    </aside>
  )
}
