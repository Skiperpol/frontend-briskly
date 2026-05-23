import L from "leaflet"

import type { LatLngTuple } from "@/domain/models/GeoPosition"

const MIN_LAT_SPAN = 0.35
const MIN_LNG_SPAN = 0.35

/** Początkowy kadr: obie Ameryki, Afryka i Eurasia. */
export const WORLD_VIEW_BOUNDS = L.latLngBounds(
  [-58, -168],
  [72, 168],
)

export function expandBounds(bounds: L.LatLngBounds): L.LatLngBounds {
  const center = bounds.getCenter()
  const latSpan = Math.max(bounds.getNorth() - bounds.getSouth(), MIN_LAT_SPAN)
  const lngSpan = Math.max(bounds.getEast() - bounds.getWest(), MIN_LNG_SPAN)

  return L.latLngBounds(
    [center.lat - latSpan / 2, center.lng - lngSpan / 2],
    [center.lat + latSpan / 2, center.lng + lngSpan / 2],
  )
}

export function applyWorldView(map: L.Map): void {
  clearMapViewConstraints(map)

  const padding = L.point(20, 20)
  const zoom = Math.min(map.getBoundsZoom(WORLD_VIEW_BOUNDS, false, padding), 3)

  map.flyTo(WORLD_VIEW_BOUNDS.getCenter(), zoom, { duration: 0.6 })
}

export function applyTripView(map: L.Map, bounds: L.LatLngBounds, maxZoom: number): void {
  clearMapViewConstraints(map)

  const paddingTopLeft = L.point(8, 16)
  const paddingBottomRight = L.point(8, 16)

  map.flyToBounds(bounds, {
    paddingTopLeft,
    paddingBottomRight,
    maxZoom,
    duration: 0.6,
  })
}

export function clearMapViewConstraints(map: L.Map): void {
  map.setMinZoom(0)
  map.setMaxBounds(null as unknown as L.LatLngBounds)
  map.options.maxBoundsViscosity = 0
}

export function positionsToBounds(positions: LatLngTuple[]): L.LatLngBounds | null {
  if (positions.length === 0) return null
  if (positions.length === 1) {
    const [lat, lng] = positions[0]
    return expandBounds(L.latLngBounds([lat, lng], [lat, lng]))
  }
  return expandBounds(L.latLngBounds(positions))
}
