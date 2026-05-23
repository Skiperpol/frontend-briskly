import * as React from "react"

import { cn } from "@/shared/lib/utils"

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "min-h-0 overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { ScrollArea }
