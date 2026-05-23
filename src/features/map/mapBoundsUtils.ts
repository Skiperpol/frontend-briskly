import L from "leaflet"

import type { LatLngTuple } from "@/domain/models/GeoPosition"

const MIN_LAT_SPAN = 0.35
const MIN_LNG_SPAN = 0.35

/** Pełny widok świata: obie Ameryki, Afryka i Eurasia bez „ucięcia” góra/dół. */
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

/** Maksymalny zoom, przy którym zakres szerokości geograficznej wypełnia wysokość mapy. */
export function getZoomFillingHeight(
  map: L.Map,
  bounds: L.LatLngBounds,
  verticalPadding: number,
): number {
  const mapSize = map.getSize()
  if (mapSize.y <= 0) return map.getZoom()

  const availableHeight = mapSize.y - verticalPadding * 2
  const southWest = bounds.getSouthWest()
  const northEast = bounds.getNorthEast()

  for (let zoom = map.getMaxZoom(); zoom >= 0; zoom -= 1) {
    const northWestPoint = map.project([northEast.lat, southWest.lng], zoom)
    const southEastPoint = map.project([southWest.lat, northEast.lng], zoom)
    const height = Math.abs(southEastPoint.y - northWestPoint.y)

    if (height <= availableHeight) {
      return zoom
    }
  }

  return 0
}

export function getZoomFittingWidth(
  map: L.Map,
  bounds: L.LatLngBounds,
  horizontalPadding: number,
): number {
  const mapSize = map.getSize()
  if (mapSize.x <= 0) return map.getZoom()

  const availableWidth = mapSize.x - horizontalPadding * 2
  const southWest = bounds.getSouthWest()
  const northEast = bounds.getNorthEast()

  for (let zoom = map.getMaxZoom(); zoom >= 0; zoom -= 1) {
    const northWestPoint = map.project([northEast.lat, southWest.lng], zoom)
    const southEastPoint = map.project([southWest.lat, northEast.lng], zoom)
    const width = Math.abs(southEastPoint.x - northWestPoint.x)

    if (width <= availableWidth) {
      return zoom
    }
  }

  return 0
}

export function getTightFitZoom(
  map: L.Map,
  bounds: L.LatLngBounds,
  verticalPadding: number,
  horizontalPadding: number,
  maxZoom: number,
): number {
  const zoomForHeight = getZoomFillingHeight(map, bounds, verticalPadding)
  const zoomForWidth = getZoomFittingWidth(map, bounds, horizontalPadding)

  // Priorytet: wypełnienie wysokości (brak szarych pasów góra/dół).
  // Nie oddalaj ponad zoom wymagany przez szerokość trasy.
  return Math.min(Math.max(zoomForHeight, zoomForWidth), maxZoom)
}

export function applyWorldView(map: L.Map): number {
  const padding = L.point(20, 20)
  const fitZoom = map.getBoundsZoom(WORLD_VIEW_BOUNDS, false, padding)
  const zoom = Math.min(fitZoom, 3)

  map.setMinZoom(Math.max(zoom - 1, 1))
  map.setMaxBounds(WORLD_VIEW_BOUNDS)
  map.options.maxBoundsViscosity = 1
  map.flyTo(WORLD_VIEW_BOUNDS.getCenter(), zoom, { duration: 0.6 })

  return zoom
}

export function applyMapViewConstraints(
  map: L.Map,
  bounds: L.LatLngBounds,
  options: {
    verticalPadding: number
    horizontalPadding: number
    maxZoom: number
    maxBoundsPadding?: number
  },
): number {
  const {
    verticalPadding,
    horizontalPadding,
    maxZoom,
    maxBoundsPadding = 0.12,
  } = options

  const fitZoom = getTightFitZoom(map, bounds, verticalPadding, horizontalPadding, maxZoom)
  const center = bounds.getCenter()

  map.setMinZoom(fitZoom)
  map.setMaxBounds(bounds.pad(maxBoundsPadding))
  map.options.maxBoundsViscosity = 1
  map.setView(center, fitZoom, { animate: false })

  return fitZoom
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
