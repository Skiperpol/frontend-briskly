import type { GeoPosition } from "@/domain/models/GeoPosition"
import type { ScheduleStop } from "@/domain/models/ScheduleStop"
import type { UserTrip } from "@/domain/models/UserTrip"

import { TRIP_MAP_COLORS } from "./tripMapConstants"

export type TripMapStop = {
  id: string
  label: string
  position: GeoPosition
}

export type TripMapLayer = {
  tripId: string
  name: string
  color: string
  /** Wypełniane przez Mapbox Directions (drogi). */
  path: GeoPosition[]
  stops: TripMapStop[]
  /** Przerywana linia (np. podgląd przed zatwierdzeniem). */
  dashed?: boolean
}

export function buildTripMapLayers(trips: UserTrip[]): TripMapLayer[] {
  return trips
    .map((trip, index) => {
      const stops = trip.scheduleStops
        .map((stop) => toMapStop(stop))
        .filter((stop): stop is TripMapStop => stop !== null)

      if (stops.length < 2) return null

      return {
        tripId: trip.id,
        name: trip.name,
        color: TRIP_MAP_COLORS[index % TRIP_MAP_COLORS.length] as string,
        path: [] as GeoPosition[],
        stops,
      }
    })
    .filter((layer): layer is TripMapLayer => layer !== null)
}

function toMapStop(stop: ScheduleStop): TripMapStop | null {
  if (!stop.position) return null

  return {
    id: stop.id,
    label: stop.subtitle || stop.title,
    position: stop.position,
  }
}

export function getLayerDisplayPath(layer: TripMapLayer): GeoPosition[] {
  return layer.path.length >= 2 ? layer.path : []
}

export function collectAllPositions(layers: TripMapLayer[]): GeoPosition[] {
  return layers.flatMap((layer) => [
    ...getLayerDisplayPath(layer),
    ...layer.stops.map((stop) => stop.position),
  ])
}

/** Pozycje przystanków — stabilne podczas ładowania geometrii trasy (kamera mapy). */
export function collectStopPositions(layers: TripMapLayer[]): GeoPosition[] {
  return layers.flatMap((layer) => layer.stops.map((stop) => stop.position))
}
