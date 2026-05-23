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
  path: GeoPosition[]
  stops: TripMapStop[]
}

export function buildTripMapLayers(trips: UserTrip[]): TripMapLayer[] {
  return trips
    .map((trip, index) => {
      const stops = trip.scheduleStops
        .map((stop) => toMapStop(stop))
        .filter((stop): stop is TripMapStop => stop !== null)

      const path =
        trip.mapPath.length > 0
          ? trip.mapPath
          : stops.map((stop) => stop.position)

      if (path.length === 0) return null

      return {
        tripId: trip.id,
        name: trip.name,
        color: TRIP_MAP_COLORS[index % TRIP_MAP_COLORS.length] as string,
        path,
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

export function collectAllPositions(layers: TripMapLayer[]): GeoPosition[] {
  return layers.flatMap((layer) => [
    ...layer.path,
    ...layer.stops.map((stop) => stop.position),
  ])
}
