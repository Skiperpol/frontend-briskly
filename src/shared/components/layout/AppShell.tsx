import { Outlet } from "react-router-dom"

import { AppSidebar } from "./AppSidebar"

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}
