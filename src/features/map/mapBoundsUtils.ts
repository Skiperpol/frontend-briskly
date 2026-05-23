import L from "leaflet"

import type { LatLngTuple } from "@/domain/models/GeoPosition"

const MIN_LAT_SPAN = 0.35
const MIN_LNG_SPAN = 0.35

/** Początkowy kadr: obie Ameryki, Afryka i Eurasia. */
export const WORLD_VIEW_BOUNDS = L.latLngBounds(
  [-58, -168],
  [72, 168],
)

const MAX_LAT = 85.05112878
const MIN_LAT = -85.05112878

/**
 * Ogranicza tylko szerokość geograficzną.
 * Szeroki zakres długości geograficznej pozwala na swobodne przesuwanie w poziomie (worldCopyJump).
 */
export const LATITUDE_MAX_BOUNDS = L.latLngBounds(
  [MIN_LAT, -400],
  [MAX_LAT, 400],
)

function clampMapLatitude(map: L.Map): void {
  const bounds = map.getBounds()
  if (bounds.getNorth() <= MAX_LAT && bounds.getSouth() >= MIN_LAT) return

  const center = map.getCenter()
  const zoom = map.getZoom()
  const latSpan = bounds.getNorth() - bounds.getSouth()
  let lat = center.lat

  if (latSpan >= MAX_LAT - MIN_LAT) {
    lat = 0
  } else if (bounds.getNorth() > MAX_LAT) {
    lat = MAX_LAT - latSpan / 2
  } else if (bounds.getSouth() < MIN_LAT) {
    lat = MIN_LAT + latSpan / 2
  }

  if (Math.abs(lat - center.lat) > 1e-8) {
    map.setView([lat, center.lng], zoom, { animate: false })
  }
}

export function setupLatitudeClamp(map: L.Map): () => void {
  map.setMaxBounds(LATITUDE_MAX_BOUNDS)
  map.options.maxBoundsViscosity = 1

  const onMove = () => clampMapLatitude(map)

  map.on("move", onMove)
  map.on("zoomend", onMove)

  return () => {
    map.off("move", onMove)
    map.off("zoomend", onMove)
    map.setMaxBounds(null as unknown as L.LatLngBounds)
    map.options.maxBoundsViscosity = 0
  }
}

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
  const padding = L.point(20, 20)
  const zoom = Math.min(map.getBoundsZoom(WORLD_VIEW_BOUNDS, false, padding), 3)

  map.flyTo(WORLD_VIEW_BOUNDS.getCenter(), zoom, { duration: 0.6 })
}

export function applyTripView(map: L.Map, bounds: L.LatLngBounds, maxZoom: number): void {
  const paddingTopLeft = L.point(8, 16)
  const paddingBottomRight = L.point(8, 16)

  map.flyToBounds(bounds, {
    paddingTopLeft,
    paddingBottomRight,
    maxZoom,
    duration: 0.6,
  })
}

export function positionsToBounds(positions: LatLngTuple[]): L.LatLngBounds | null {
  if (positions.length === 0) return null
  if (positions.length === 1) {
    const [lat, lng] = positions[0]
    return expandBounds(L.latLngBounds([lat, lng], [lat, lng]))
  }
  return expandBounds(L.latLngBounds(positions))
}
