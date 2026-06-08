import { useMemo } from "react"

import { UserTrip } from "@/domain/models"
import { buildTripMapLayers } from "@/features/map/tripMapUtils"
import { useDashboardStatsQuery } from "@/shared/hooks/queries/useDashboardStatsQuery"
import { useTripsQuery } from "@/shared/hooks/queries/useTripsQuery"

const EMPTY_TRIP = new UserTrip(
  "empty",
  "empty",
  "Brak podróży",
  "",
  "",
  "",
  [],
  new Date(),
  [],
  [],
  [],
  null,
  [],
)

export function useTripData() {
  const tripsQuery = useTripsQuery()
  const statsQuery = useDashboardStatsQuery()

  const journalTrips = useMemo(
    () => tripsQuery.data?.map((bundle) => bundle.trip) ?? [],
    [tripsQuery.data],
  )

  const tripMapLayers = useMemo(() => buildTripMapLayers(journalTrips), [journalTrips])

  const errorMessage =
    (tripsQuery.error instanceof Error ? tripsQuery.error.message : null) ??
    (statsQuery.error instanceof Error ? statsQuery.error.message : null)

  return {
    loading: tripsQuery.isLoading,
    error: errorMessage,
    activeTrip: journalTrips[0] ?? EMPTY_TRIP,
    journalTrips,
    tripBundles: tripsQuery.data ?? [],
    tripMapLayers,
    stats: statsQuery.data!,
  }
}
