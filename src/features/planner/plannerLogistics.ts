import {
  mapDestinationsToConnectionOptions,
  waitingMinutesToSeconds,
} from "@/features/planner/plannerConnectionUtils"
import type {
  PlannerCity,
  PlannerConnectionOption,
  PlannerDepartureStop,
  PlannerRouteLeg,
} from "@/features/planner/types"
import {
  findDestinationsFromStop,
  listPopularCities,
  searchCities,
  searchStops,
} from "@/shared/api/logisticsApi"

export function legToDepartureStop(leg: PlannerRouteLeg): PlannerDepartureStop {
  return {
    id: leg.stopId,
    cityId: leg.cityId,
    name: leg.stopName,
    address: leg.address,
    position: leg.position,
  }
}

function mapApiCityToPlanner(city: {
  city_id: string
  city_name: string
  city_lat?: number
  city_long?: number
}): PlannerCity {
  return {
    id: city.city_id,
    label: city.city_name,
    mapCenter: {
      lat: city.city_lat ?? 52,
      lng: city.city_long ?? 19,
    },
    mapZoom: 11,
  }
}

export async function fetchPopularPlannerCities(limit = 20): Promise<PlannerCity[]> {
  const cities = await listPopularCities(limit)
  return cities.map(mapApiCityToPlanner)
}

export async function fetchPlannerCities(query: string): Promise<PlannerCity[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) {
    return fetchPopularPlannerCities()
  }

  const cities = await searchCities(trimmed, 10)
  return cities.map(mapApiCityToPlanner)
}

export async function fetchStopsForCity(
  cityId: string,
  cityLabel: string,
): Promise<PlannerDepartureStop[]> {
  const groups = await searchStops(cityLabel, 10, 20)
  const group = groups.find((item) => item.city_id === cityId) ?? groups[0]
  if (!group) return []

  return group.stops.map((stop) => ({
    id: stop.stop_id,
    cityId: group.city_id,
    name: stop.stop_name,
    address: stop.suburb || group.city_name,
    position: { lat: stop.stop_lat, lng: stop.stop_lon },
  }))
}

export async function fetchConnectionsFromStop(
  lastLeg: PlannerRouteLeg,
  readyDate: string,
  readyTime: string,
  waitingMinutes: number,
  excludeStopIds: string[],
): Promise<PlannerConnectionOption[]> {
  if (!readyDate || !readyTime) return []

  const excluded = new Set(excludeStopIds)
  const response = await findDestinationsFromStop({
    fromStop: lastLeg.stopId,
    date: readyDate,
    time: readyTime.slice(0, 5),
    waitingTimeSeconds: waitingMinutesToSeconds(waitingMinutes),
    timezone: "Europe/Warsaw",
    limit: 100,
    stopsPerCity: 10,
  })

  const connections = response.connections.filter(
    (connection) => !excluded.has(connection.destination_stop_id),
  )

  return mapDestinationsToConnectionOptions({ ...response, connections })
}
