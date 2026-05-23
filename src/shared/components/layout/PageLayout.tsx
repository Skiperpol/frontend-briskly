import type { ReactNode } from "react"

import { TopBar } from "@/shared/components/layout/TopBar"

type PageLayoutProps = {
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}

export function PageLayout({ title, subtitle, action, children }: PageLayoutProps) {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <TopBar title={title} subtitle={subtitle} action={action} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  )
}
