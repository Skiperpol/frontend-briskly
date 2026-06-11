import type { Map as MapboxMap } from "mapbox-gl"

import type { LatLngTuple } from "@/domain/models/GeoPosition"

export type MapboxBounds = [[number, number], [number, number]]

const MIN_LAT_SPAN = 0.35
const MIN_LNG_SPAN = 0.35

export const EUROPE_MAX_BOUNDS: MapboxBounds = [
  [-25, 34],
  [45, 72],
]

export const EUROPE_VIEW_BOUNDS: MapboxBounds = [
  [-18, 36],
  [38, 66],
]

export const EUROPE_DEFAULT_VIEW = {
  center: [15, 52] as [number, number],
  zoom: 3.8,
  pitch: 0,
  bearing: 0,
}

export function expandBounds(bounds: MapboxBounds): MapboxBounds {
  const [[west, south], [east, north]] = bounds
  const centerLat = (south + north) / 2
  const centerLng = (west + east) / 2
  const latSpan = Math.max(north - south, MIN_LAT_SPAN)
  const lngSpan = Math.max(east - west, MIN_LNG_SPAN)

  return [
    [centerLng - lngSpan / 2, centerLat - latSpan / 2],
    [centerLng + lngSpan / 2, centerLat + latSpan / 2],
  ]
}

function clampBoundsToEurope(bounds: MapboxBounds): MapboxBounds {
  const [[west, south], [east, north]] = bounds
  const [[eWest, eSouth], [eEast, eNorth]] = EUROPE_MAX_BOUNDS

  return [
    [Math.max(west, eWest), Math.max(south, eSouth)],
    [Math.min(east, eEast), Math.min(north, eNorth)],
  ]
}

export function positionsToBounds(positions: LatLngTuple[]): MapboxBounds | null {
  if (positions.length === 0) return null

  let minLat = positions[0][0]
  let maxLat = positions[0][0]
  let minLng = positions[0][1]
  let maxLng = positions[0][1]

  for (const [lat, lng] of positions) {
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
  }

  return clampBoundsToEurope(
    expandBounds([
      [minLng, minLat],
      [maxLng, maxLat],
    ]),
  )
}

export function applyEuropeView(map: MapboxMap, animate = true): void {
  map.stop()
  map.easeTo({
    ...EUROPE_DEFAULT_VIEW,
    duration: animate ? 700 : 0,
  })
}

export function applyTripView(
  map: MapboxMap,
  bounds: MapboxBounds,
  maxZoom: number,
  animate = true,
): void {
  map.stop()
  map.fitBounds(clampBoundsToEurope(bounds), {
    padding: { top: 48, bottom: 48, left: 48, right: 48 },
    maxZoom,
    duration: animate ? 600 : 0,
    linear: true,
  })
}

export function applyPointView(
  map: MapboxMap,
  [lat, lng]: LatLngTuple,
  zoom = 13,
  animate = true,
): void {
  const [[eWest, eSouth], [eEast, eNorth]] = EUROPE_MAX_BOUNDS
  const clampedLng = Math.min(Math.max(lng, eWest), eEast)
  const clampedLat = Math.min(Math.max(lat, eSouth), eNorth)

  map.stop()
  map.easeTo({
    center: [clampedLng, clampedLat],
    zoom,
    pitch: 0,
    bearing: 0,
    duration: animate ? 600 : 0,
  })
}
