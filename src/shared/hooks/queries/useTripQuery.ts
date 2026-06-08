import { useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchTripDetail, type TripDetailBundle } from "@/domain/trips/tripLoader"
import { queryKeys } from "@/shared/api/queryKeys"
import { useAuth } from "@/shared/context/AuthContext"

export function useTripQuery(tripId: string | undefined) {
  const { isAuthenticated, isReady } = useAuth()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: queryKeys.trips.detail(tripId ?? ""),
    queryFn: () => {
      if (!tripId) return undefined
      return fetchTripDetail(tripId)
    },
    enabled: isReady && isAuthenticated && Boolean(tripId),
    placeholderData: () => {
      if (!tripId) return undefined
      const cached = queryClient.getQueryData<TripDetailBundle>(
        queryKeys.trips.detail(tripId),
      )
      if (cached) return cached

      const list = queryClient.getQueryData<TripDetailBundle[]>(queryKeys.trips.list())
      return list?.find((bundle) => bundle.trip.id === tripId)
    },
  })
}
