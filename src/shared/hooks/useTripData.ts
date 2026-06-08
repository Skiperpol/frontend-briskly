import { useEffect, useState } from "react"

import type { DashboardStats, UserTrip } from "@/domain/models"
import { TripService } from "@/domain/services"
import { buildTripMapLayers } from "@/features/map/tripMapUtils"

type TripDataState = {
  loading: boolean
  error: string | null
  activeTrip: UserTrip
  journalTrips: UserTrip[]
  tripMapLayers: ReturnType<typeof buildTripMapLayers>
  stats: DashboardStats
}

const EMPTY_STATS = {
  loading: true,
  error: null,
  activeTrip: TripService.getInstance().getActiveTrip(),
  journalTrips: [] as UserTrip[],
  tripMapLayers: [] as ReturnType<typeof buildTripMapLayers>,
  stats: TripService.getInstance().getStats(),
}

export function useTripData() {
  const [state, setState] = useState<TripDataState>(EMPTY_STATS)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const service = TripService.getInstance()
        await service.ensureLoaded()
        if (cancelled) return

        const journalTrips = service.getJournalTrips()
        setState({
          loading: false,
          error: null,
          activeTrip: service.getActiveTrip(),
          journalTrips,
          tripMapLayers: buildTripMapLayers(journalTrips),
          stats: service.getStats(),
        })
      } catch (error) {
        if (cancelled) return
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Nie udało się załadować podróży.",
        }))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
