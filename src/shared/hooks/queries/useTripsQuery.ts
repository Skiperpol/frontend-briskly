import { useQuery } from "@tanstack/react-query"

import { fetchTripsList } from "@/domain/trips/tripLoader"
import { queryKeys } from "@/shared/api/queryKeys"
import { useAuth } from "@/shared/context/AuthContext"

export function useTripsQuery() {
  const { isAuthenticated, isReady } = useAuth()

  return useQuery({
    queryKey: queryKeys.trips.list(),
    queryFn: fetchTripsList,
    enabled: isReady && isAuthenticated,
  })
}
