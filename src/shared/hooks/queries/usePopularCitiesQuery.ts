import { useQuery } from "@tanstack/react-query"

import { fetchPopularPlannerCities } from "@/features/planner/plannerLogistics"
import { queryKeys } from "@/shared/api/queryKeys"

export function usePopularCitiesQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.cities.popular(),
    queryFn: () => fetchPopularPlannerCities(),
    staleTime: 5 * 60_000,
    enabled,
  })
}
