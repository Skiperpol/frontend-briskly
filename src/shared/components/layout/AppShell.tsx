import { useEffect } from "react"
import { Outlet } from "react-router-dom"

import { AppSidebar } from "./AppSidebar"
import { SidebarProvider, useSidebar } from "./SidebarContext"

function AppShellContent() {
  const { mobileOpen, closeMobile } = useSidebar()

  useEffect(() => {
    if (!mobileOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileOpen])

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <AppSidebar variant="desktop" />

      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            aria-label="Zamknij menu"
            onClick={closeMobile}
          />
          <AppSidebar variant="mobile" onNavigate={closeMobile} />
        </>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}

export function AppShell() {
  return (
    <SidebarProvider>
      <AppShellContent />
    </SidebarProvider>
  )
}
