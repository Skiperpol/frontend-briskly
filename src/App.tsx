import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { AuthPage } from "@/features/auth/AuthPage"
import { DashboardPage } from "@/features/dashboard/DashboardPage"
import { JournalPage } from "@/features/journal/JournalPage"
import { GlobalMapPage } from "@/features/map/GlobalMapPage"
import { PlannerPage } from "@/features/planner/PlannerPage"
import { SchedulePage } from "@/features/schedule/SchedulePage"
import { AppShell } from "@/shared/components/layout/AppShell"
import { ProtectedRoute } from "@/shared/components/layout/ProtectedRoute"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="planner" element={<PlannerPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="journal" element={<JournalPage />} />
            <Route path="map" element={<GlobalMapPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
