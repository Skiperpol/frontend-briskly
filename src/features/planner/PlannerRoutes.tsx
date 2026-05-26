import { Route, Routes } from "react-router-dom"

import { PlannerEditorPage } from "@/features/planner/PlannerEditorPage"
import { PlannerHomePage } from "@/features/planner/PlannerHomePage"

export function PlannerRoutes() {
  return (
    <Routes>
      <Route index element={<PlannerHomePage />} />
      <Route path=":tripId" element={<PlannerEditorPage />} />
    </Routes>
  )
}
