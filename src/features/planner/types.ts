import type { GeoPosition } from "@/domain/models/GeoPosition"
import type { ApiStopDestinationConnection } from "@/shared/api/types"

export type PlannerCity = {
  id: string
  label: string
  mapCenter: GeoPosition
  mapZoom: number
}

export type PlannerDepartureStop = {
  id: string
  cityId: string
  name: string
  address: string
  position: GeoPosition
}

export type PlannerLegConnectionMeta = {
  gtfs_trip: string
  departure_date: string
  departure_time: string
  arrival_date: string
  arrival_time: string
  duration_in_travel: number
  duration_waiting: number
  duration_total: number
  searchReadyDate?: string
  searchReadyTime?: string
  searchWaitingSeconds?: number
}

export type PlannerRouteLeg = {
  id: string
  cityId: string
  cityLabel: string
  stopId: string
  stopName: string
  address: string
  position: GeoPosition
  date: string
  time: string
  connectionMeta?: PlannerLegConnectionMeta
}

export type PlannerConnectionOption = {
  connection: ApiStopDestinationConnection
  destinationStopName: string
  destinationCityLabel: string
  destinationAddress: string
  position: GeoPosition
  stopId: string
  cityId: string
}

export type RecommendedStop = {
  stop: PlannerDepartureStop
  distanceKm: number
  cityLabel: string
}
