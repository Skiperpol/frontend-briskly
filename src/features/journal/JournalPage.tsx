import { Route, Routes } from "react-router-dom"

import { JournalDetailPage } from "@/features/journal/JournalDetailPage"
import { JournalTripListPage } from "@/features/journal/JournalTripListPage"

export function JournalPage() {
  return (
    <Routes>
      <Route index element={<JournalTripListPage />} />
      <Route path=":tripId" element={<JournalDetailPage />} />
    </Routes>
  )
}
