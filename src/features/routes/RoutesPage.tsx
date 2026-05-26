import { Route, Routes } from "react-router-dom"

import { JournalDetailPage } from "@/features/journal/JournalDetailPage"
import { ScheduleTripPage } from "@/features/routes/ScheduleTripPage"
import { TripListPage } from "@/features/routes/TripListPage"

export function RoutesPage() {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <Routes>
        <Route index element={<TripListPage />} />
        <Route path=":tripId/dziennik" element={<JournalDetailPage />} />
        <Route path=":tripId/harmonogram" element={<ScheduleTripPage />} />
      </Routes>
    </div>
  )
}
