import { Route, Routes } from "react-router-dom"

import { JournalDetailPage } from "@/features/journal/JournalDetailPage"
import { JournalTripListPage } from "@/features/journal/JournalTripListPage"

export function JournalPage() {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <Routes>
        <Route index element={<JournalTripListPage />} />
        <Route path=":tripId" element={<JournalDetailPage />} />
      </Routes>
    </div>
  )
}
