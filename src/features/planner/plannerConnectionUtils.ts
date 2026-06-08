import type { GeoPosition } from "@/domain/models/GeoPosition"
import type {
  ApiDestinationStopRef,
  ApiStopDestinationConnection,
  ApiStopDestinationsResponse,
} from "@/shared/api/types"

import type { PlannerConnectionOption, PlannerRouteLeg } from "./types"

export function destinationStopToPosition(stop: ApiDestinationStopRef): GeoPosition {
  const lat = stop.lat
  const lng = stop.lon
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng }
  }
  return { lat: 52, lng: 19 }
}

export const WAITING_TIME_PRESETS = [
  { label: "30 min", minutes: 30 },
  { label: "1 godz.", minutes: 60 },
  { label: "2 godz.", minutes: 120 },
  { label: "3 godz.", minutes: 180 },
  { label: "6 godz.", minutes: 360 },
  { label: "12 godz.", minutes: 720 },
  { label: "24 godz.", minutes: 1440 },
  { label: "Tydzień", minutes: 10_080 },
] as const

export function filterAndSortConnections(
  options: PlannerConnectionOption[],
  destinationCityId?: string | null,
): PlannerConnectionOption[] {
  const filtered = destinationCityId
    ? options.filter((option) => option.cityId === destinationCityId)
    : options

  return [...filtered].sort(
    (left, right) =>
      left.connection.duration_waiting - right.connection.duration_waiting,
  )
}

export function formatDepartureIn(durationSeconds: number): string {
  if (durationSeconds <= 0) return "Teraz"
  return `Za ${formatDurationSeconds(durationSeconds)}`
}

export const DEFAULT_WAITING_MINUTES = 60

export function waitingMinutesToSeconds(minutes: number): number {
  return Math.max(1, Math.round(minutes * 60))
}

export function formatDurationSeconds(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (days > 0) {
    if (hours > 0) return `${days} dni ${hours} godz.`
    return days === 1 ? "1 dzień" : `${days} dni`
  }
  if (hours > 0) return `${hours} godz. ${minutes} min`
  return `${minutes} min`
}

export function formatSchedule(date: string, time: string): string {
  const normalizedTime = time.length === 5 ? `${time}:00` : time
  const parsed = new Date(`${date}T${normalizedTime}`)
  if (Number.isNaN(parsed.getTime())) {
    return `${date}, ${time}`
  }

  return parsed.toLocaleString("pl-PL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function mapDestinationsToConnectionOptions(
  response: ApiStopDestinationsResponse,
): PlannerConnectionOption[] {
  return response.connections.map((connection) => {
    const stop = response.stops[connection.destination_stop_id]
    const city = response.cities[connection.destination_city_id]

    return {
      connection,
      destinationStopName: stop?.stop_name ?? connection.destination_stop_id,
      destinationCityLabel: city?.city_name ?? "Nieznane miasto",
      destinationAddress: stop?.suburb ?? city?.region ?? "",
      position: stop ? destinationStopToPosition(stop) : { lat: 52, lng: 19 },
      stopId: connection.destination_stop_id,
      cityId: connection.destination_city_id,
    }
  })
}

export function connectionOptionToLeg(
  option: PlannerConnectionOption,
  search: {
    readyDate: string
    readyTime: string
    waitingSeconds: number
  },
): Omit<PlannerRouteLeg, "id"> {
  const { connection } = option

  return {
    cityId: option.cityId,
    cityLabel: option.destinationCityLabel,
    stopId: option.stopId,
    stopName: option.destinationStopName,
    address: option.destinationAddress,
    position: option.position,
    date: connection.arrival_date,
    time: connection.arrival_time.slice(0, 5),
    connectionMeta: {
      gtfs_trip: connection.trip_id,
      departure_date: connection.departure_date,
      departure_time: connection.departure_time,
      arrival_date: connection.arrival_date,
      arrival_time: connection.arrival_time,
      duration_in_travel: connection.duration_in_travel,
      duration_waiting: connection.duration_waiting,
      duration_total: connection.duration_total,
      searchReadyDate: search.readyDate,
      searchReadyTime: search.readyTime,
      searchWaitingSeconds: search.waitingSeconds,
    },
  }
}

export function connectionToPlannerLegMeta(connection: ApiStopDestinationConnection) {
  return {
    gtfs_trip: connection.trip_id,
    departure_date: connection.departure_date,
    departure_time: connection.departure_time,
    arrival_date: connection.arrival_date,
    arrival_time: connection.arrival_time,
    duration_in_travel: connection.duration_in_travel,
    duration_waiting: connection.duration_waiting,
    duration_total: connection.duration_total,
  }
}
