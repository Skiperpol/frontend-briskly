import { useMemo } from "react"

import { TripService } from "@/domain/services"
import { buildTripMapLayers } from "@/features/map/tripMapUtils"

export function useTripData() {
  return useMemo(() => {
    const service = TripService.getInstance()
    const journalTrips = service.getJournalTrips()
    return {
      activeTrip: service.getActiveTrip(),
      journalTrips,
      tripMapLayers: buildTripMapLayers(journalTrips),
      destinations: service.getDestinations(),
      activities: service.getActivities(),
      travelLogs: service.getTravelLogs(),
      stats: service.getStats(),
    }
  }, [])
}
