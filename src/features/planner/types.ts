import type { GeoPosition } from "@/domain/models/GeoPosition"

export type PlannerCity = {
  id: string
  label: string
  /** Środek mapy po wyborze miasta (przed wyborem przystanku). */
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
}

export type RecommendedStop = {
  stop: PlannerDepartureStop
  distanceKm: number
  cityLabel: string
}
