import type { GeoPosition } from "@/domain/models/GeoPosition"
import {
  DEPARTURE_STOPS,
  getPlannerCity,
} from "@/features/planner/plannerStops"
import type { RecommendedStop } from "@/features/planner/types"

const EARTH_RADIUS_KM = 6371
const NEARBY_MAX_KM = 400
const MIN_DISTANCE_KM = 8

function haversineKm(a: GeoPosition, b: GeoPosition): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

export function getRecommendedStopsNear(
  origin: GeoPosition,
  excludeStopIds: string[],
  limit = 6,
): RecommendedStop[] {
  const excluded = new Set(excludeStopIds)

  return DEPARTURE_STOPS.filter((stop) => !excluded.has(stop.id))
    .map((stop) => ({
      stop,
      distanceKm: haversineKm(origin, stop.position),
      cityLabel: getPlannerCity(stop.cityId)?.label ?? stop.cityId,
    }))
    .filter(
      (item) =>
        item.distanceKm >= MIN_DISTANCE_KM && item.distanceKm <= NEARBY_MAX_KM,
    )
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
}
