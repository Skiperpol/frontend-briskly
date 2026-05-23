import { useMemo } from "react"

import { TripService } from "@/domain/services"

export function useTripData() {
  return useMemo(() => {
    const service = TripService.getInstance()
    return {
      activeTrip: service.getActiveTrip(),
      journalTrips: service.getJournalTrips(),
      destinations: service.getDestinations(),
      activities: service.getActivities(),
      travelLogs: service.getTravelLogs(),
      stats: service.getStats(),
    }
  }, [])
}
