import type { ReactNode } from "react"

import { cn } from "@/shared/lib/utils"

type TopBarProps = {
  title?: string
  subtitle?: string
  action?: ReactNode
  trailing?: ReactNode
}

export function TopBar({ title, subtitle, action, trailing }: TopBarProps) {
  const hasTitleBlock = Boolean(title || subtitle)

  return (
    <header className="flex h-14 w-full shrink-0 items-center justify-between gap-4 border-b border-border bg-sidebar px-6">
      <div className="flex min-w-0 flex-1 items-center gap-4">
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
                "mt-0.5 truncate text-[10px] font-medium uppercase leading-tight tracking-wider",
                subtitle ? "text-muted-foreground" : "invisible",
              )}
              aria-hidden={!subtitle}
            >
              {subtitle || "\u00a0"}
            </p>
          </div>
        )}
      </div>

      {trailing ? <div className="flex shrink-0 items-center">{trailing}</div> : null}
    </header>
  )
}
