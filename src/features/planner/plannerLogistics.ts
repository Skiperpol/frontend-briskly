import type {
  PlannerCity,
  PlannerDepartureStop,
  PlannerRouteLeg,
  RecommendedStop,
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

export async function fetchRecommendedStops(
  lastLeg: PlannerRouteLeg,
  excludeStopIds: string[],
  limit = 6,
): Promise<RecommendedStop[]> {
  const excluded = new Set(excludeStopIds)
  const response = await findDestinationsFromStop({
    fromStop: lastLeg.stopId,
    date: lastLeg.date,
    time: lastLeg.time,
    waitingTimeSeconds: 3600,
    timezone: "Europe/Warsaw",
    limit: 100,
  })

  return response.connections
    .filter((connection) => !excluded.has(connection.destination_stop_id))
    .slice(0, limit)
    .map((connection) => {
      const stop = response.stops[connection.destination_stop_id]
      const city = response.cities[connection.destination_city_id]
      if (!stop) {
        return null
      }

      return {
        stop: {
          id: stop.stop_id,
          cityId: stop.city_id,
          name: stop.stop_name,
          address: stop.suburb ?? stop.region ?? stop.city_name,
          position: { lat: stop.latitude, lng: stop.longitude },
        },
        distanceKm: connection.duration_in_travel / 60,
        cityLabel: city?.city_name ?? stop.city_name,
      }
    })
    .filter((item): item is RecommendedStop => item !== null)
}
