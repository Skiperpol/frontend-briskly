import { lazy, Suspense } from "react"
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom"

import { AuthPage } from "@/features/auth/AuthPage"
import { PlannerRoutes } from "@/features/planner/PlannerRoutes"
import { RoutesPage } from "@/features/routes/RoutesPage"
import { SettingsPage } from "@/features/settings/SettingsPage"
import { AppShell } from "@/shared/components/layout/AppShell"
import { ProtectedRoute } from "@/shared/components/layout/ProtectedRoute"

const GlobalMapPage = lazy(() =>
  import("@/features/map/GlobalMapPage").then((module) => ({
    default: module.GlobalMapPage,
  })),
)

function RedirectJournalTrip() {
  const { tripId } = useParams<{ tripId: string }>()
  return <Navigate to={`/trasy/${tripId}/dziennik`} replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/trasy" replace />} />
            <Route path="planner/*" element={<PlannerRoutes />} />
            <Route path="trasy/*" element={<RoutesPage />} />
            <Route path="journal" element={<Navigate to="/trasy" replace />} />
            <Route path="journal/:tripId" element={<RedirectJournalTrip />} />
            <Route path="schedule" element={<Navigate to="/trasy" replace />} />
            <Route
              path="map"
              element={
                <Suspense
                  fallback={
                    <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                      Ładowanie mapy…
                    </div>
                  }
                >
                  <GlobalMapPage />
                </Suspense>
              }
            />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/trasy" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
