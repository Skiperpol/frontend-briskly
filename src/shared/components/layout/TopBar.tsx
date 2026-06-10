import { Menu } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/shared/components/ui/button"
import { useSidebar } from "@/shared/components/layout/SidebarContext"
import { cn } from "@/shared/lib/utils"

type TopBarProps = {
  title?: string
  subtitle?: string
  action?: ReactNode
  trailing?: ReactNode
}

export function TopBar({ title, subtitle, action, trailing }: TopBarProps) {
  const { toggleMobile } = useSidebar()
  const hasTitleBlock = Boolean(title || subtitle)

  return (
    <header className="flex min-h-14 w-full shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-sidebar px-4 py-2 sm:gap-3 sm:px-6 lg:flex-nowrap lg:py-0">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 lg:hidden"
          onClick={toggleMobile}
          aria-label="Otwórz menu nawigacji"
        >
          <Menu className="size-5" />
        </Button>
        {action}
        {hasTitleBlock && (
          <div className="flex min-w-0 flex-col justify-center">
            <h1
              className={cn(
                "truncate text-sm font-semibold leading-tight",
                !title && "invisible",
              )}
              aria-hidden={!title}
            >
              {title || "\u00a0"}
            </h1>
            <p
              className={cn(
                "mt-0.5 hidden truncate text-[10px] font-medium uppercase leading-tight tracking-wider sm:block",
                subtitle ? "text-muted-foreground" : "invisible",
              )}
              aria-hidden={!subtitle}
            >
              {subtitle || "\u00a0"}
            </p>
          </div>
        )}
      </div>

      {trailing ? (
        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
          {trailing}
        </div>
      ) : null}
    </header>
  )
}
