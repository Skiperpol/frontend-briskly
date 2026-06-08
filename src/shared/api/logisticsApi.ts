import type { ApiCity, ApiCityStopsGroup, ApiStopDestinationsResponse } from "@/shared/api/types"
import { apiRequest } from "@/shared/api/client"

export async function getCityDetail(cityId: string) {
  return apiRequest<{
    city_id: string
    city_name: string
    city_lat: number
    city_long: number
    city_country_code: string
    city_country_name: string
    city_region_name: string
  }>(`/cities/${cityId}/`)
}

export async function listPopularCities(limit = 20): Promise<ApiCity[]> {
  const params = new URLSearchParams({ limit: String(limit) })
  const data = await apiRequest<{ results: ApiCity[] }>(`/cities/?${params}`)
  return data.results
}

export async function searchCities(query: string, limit = 10): Promise<ApiCity[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) })
  const data = await apiRequest<{ results: ApiCity[] }>(`/cities/?${params}`)
  return data.results
}

export async function searchStops(
  query: string,
  limit = 10,
  stopsPerCity = 10,
): Promise<ApiCityStopsGroup[]> {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    stops_per_city: String(stopsPerCity),
  })
  const data = await apiRequest<{ results: ApiCityStopsGroup[] }>(`/stops/?${params}`)
  return data.results
}

export async function findDestinationsFromStop(params: {
  fromStop: string
  date: string
  time: string
  waitingTimeSeconds: number
  timezone: string
  limit?: number
}): Promise<ApiStopDestinationsResponse> {
  const search = new URLSearchParams({
    from_stop: params.fromStop,
    date: params.date,
    time: params.time,
    waitingTime: String(params.waitingTimeSeconds),
    timezone: params.timezone,
  })
  if (params.limit) {
    search.set("limit", String(params.limit))
  }
  return apiRequest<ApiStopDestinationsResponse>(`/destinations/stop/?${search}`)
}
