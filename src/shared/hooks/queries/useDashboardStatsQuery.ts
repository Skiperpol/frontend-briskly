import { useQuery } from "@tanstack/react-query"

import { loadDashboardStats } from "@/domain/trips/tripLoader"
import { DashboardStats } from "@/domain/models"
import { queryKeys } from "@/shared/api/queryKeys"
import { useAuth } from "@/shared/context/AuthContext"

const EMPTY_STATS = new DashboardStats(0, "", "0 km", "", 0, "", 0, "—", "—", "—")

export function useDashboardStatsQuery() {
  const { isAuthenticated, isReady } = useAuth()

  return useQuery({
    queryKey: queryKeys.stats.dashboard(),
    queryFn: loadDashboardStats,
    enabled: isReady && isAuthenticated,
    placeholderData: EMPTY_STATS,
  })
}
