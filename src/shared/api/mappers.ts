import {
  DashboardStats,
  JournalEntry,
  RouteLeg,
  ScheduleStop,
  TripStopPhoto,
  User,
  UserTrip,
} from "@/domain/models"
import type { PlannerRouteLeg } from "@/features/planner/types"
import type {
  ApiConnection,
  ApiDashboardStats,
  ApiNote,
  ApiStopRef,
  ApiTrip,
  ApiUser,
} from "@/shared/api/types"
import { decodeNoteHtml } from "@/features/journal/journalNoteCodec"

const DEFAULT_THUMBNAIL =
  "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&q=80"

export function mapApiUser(user: ApiUser): User {
  const displayName =
    [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
    user.username ||
    user.email

  return new User(String(user.id), user.email || user.username, displayName)
}

export function isTripFinalized(trip: ApiTrip): boolean {
  return Boolean(trip.start_date && trip.end_date)
}

function stopRefToPosition(stop: ApiStopRef) {
  return { lat: stop.latitude, lng: stop.longitude }
}

function formatTime(time: string): string {
  return time.slice(0, 5)
}

export function connectionsToScheduleStops(connections: ApiConnection[]): ScheduleStop[] {
  if (connections.length === 0) return []

  const stops: ScheduleStop[] = []
  const first = connections[0]!

  stops.push(
    new ScheduleStop(
      `stop-${first.starting_stop.stop_id}`,
      "bus",
      formatTime(first.departure_time),
      first.starting_stop.stop_name,
      `${first.starting_stop.city_name}`,
      {},
      undefined,
      undefined,
      [],
      stopRefToPosition(first.starting_stop),
    ),
  )

  for (const connection of connections) {
    const dest = connection.destination_stop
    stops.push(
      new ScheduleStop(
        `stop-${dest.stop_id}`,
        "bus",
        formatTime(connection.arrival_time),
        dest.stop_name,
        `${dest.city_name}`,
        { Data: connection.arrival_date },
        dest.thumbnail_url ?? undefined,
        undefined,
        [],
        stopRefToPosition(dest),
      ),
    )
  }

  return stops
}

export function connectionsToRouteLegs(connections: ApiConnection[]): RouteLeg[] {
  return connections.map(
    (connection) =>
      new RouteLeg(
        `leg-${connection.id}`,
        "bus",
        connection.starting_stop.stop_name,
        connection.destination_stop.stop_name,
        connection.gtfs_trip ?? "Flixbus",
        formatDuration(connection.duration_in_travel),
        "Planowana",
      ),
  )
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function connectionsToMapPath(connections: ApiConnection[]) {
  const stops = connectionsToScheduleStops(connections)
  return stops
    .map((stop) => stop.position)
    .filter((position): position is NonNullable<typeof position> => Boolean(position))
}

export function mapApiTripToUserTrip(
  trip: ApiTrip,
  connections: ApiConnection[],
  notesByConnection: Map<number, ApiNote[]>,
): UserTrip {
  const scheduleStops = connectionsToScheduleStops(connections)
  const journalEntries = connections.flatMap((connection) => {
    const notes = notesByConnection.get(connection.id) ?? []
    return notes.map((note) => mapNoteToJournalEntry(note, connection))
  })

  const location =
    scheduleStops[scheduleStops.length - 1]?.subtitle ??
    scheduleStops[0]?.subtitle ??
    "Planowanie"

  return new UserTrip(
    trip.slug,
    trip.slug,
    trip.name,
    trip.thumbnail_url ?? DEFAULT_THUMBNAIL,
    location,
    trip.description?.trim() || trip.name,
    ["#FLIXBUS"],
    trip.start_date ? new Date(trip.start_date) : new Date(trip.created_at),
    connectionsToRouteLegs(connections),
    scheduleStops,
    journalEntries,
    isTripFinalized(trip) ? new Date(trip.end_date ?? trip.start_date ?? trip.created_at) : null,
    connectionsToMapPath(connections),
    trip.journal_entry_count ?? journalEntries.length,
  )
}

function mapNoteToJournalEntry(note: ApiNote, connection: ApiConnection): JournalEntry {
  const decoded = note.html_source ? decodeNoteHtml(note.html_source) : null
  const stopId =
    decoded?.scheduleStopId ?? `stop-${connection.destination_stop.stop_id}`

  return new JournalEntry(
    String(note.id),
    stopId,
    decoded?.day ?? connection.arrival_date,
    decoded?.title ?? (note.image_url ? "Zdjęcie" : "Notatka"),
    decoded?.time ?? formatTime(connection.arrival_time),
    decoded?.body ?? (note.image_url ? "" : note.html_source),
    "note",
    note.image_url
      ? [new TripStopPhoto(`photo-${note.id}`, note.image_url, "", "", new Date(note.created_at))]
      : [],
    note.sequence_id,
    [],
  )
}

export function mapApiStatsToDashboardStats(stats: ApiDashboardStats): DashboardStats {
  return new DashboardStats(
    stats.countries_visited,
    stats.countries_delta,
    stats.total_kilometers,
    stats.kilometers_delta,
    stats.expeditions,
    stats.expeditions_delta,
    stats.photos_taken,
    stats.daily_pace,
    stats.temperature,
    stats.altitude,
  )
}

function stopRefToPlannerLeg(
  stop: ApiStopRef,
  legId: string,
  date: string,
  time: string,
): PlannerRouteLeg {
  return {
    id: legId,
    cityId: stop.city_id,
    cityLabel: stop.city_name,
    stopId: stop.stop_id,
    stopName: stop.stop_name,
    address: stop.region ?? stop.city_name,
    position: stopRefToPosition(stop),
    date,
    time: formatTime(time),
  }
}

export function connectionsToPlannerLegs(connections: ApiConnection[]): PlannerRouteLeg[] {
  if (connections.length === 0) return []

  const legs: PlannerRouteLeg[] = []
  const first = connections[0]!

  legs.push(
    stopRefToPlannerLeg(
      first.starting_stop,
      `start-${first.starting_stop.stop_id}`,
      first.departure_date,
      first.departure_time,
    ),
  )

  for (const connection of connections) {
    const leg = stopRefToPlannerLeg(
      connection.destination_stop,
      String(connection.id),
      connection.arrival_date,
      connection.arrival_time,
    )

    if (connection.gtfs_trip) {
      legs.push({
        ...leg,
        connectionMeta: {
          gtfs_trip: connection.gtfs_trip,
          departure_date: connection.departure_date,
          departure_time: connection.departure_time,
          arrival_date: connection.arrival_date,
          arrival_time: connection.arrival_time,
          duration_in_travel: connection.duration_in_travel,
          duration_waiting: connection.duration_waiting,
          duration_total: connection.duration_total,
        },
      })
    } else {
      legs.push(leg)
    }
  }

  return legs
}

export function plannerLegsToCreateConnectionPayload(
  tripSlug: string,
  fromLeg: PlannerRouteLeg,
  toLeg: PlannerRouteLeg,
  gtfs: {
    gtfs_trip: string
    departure_date: string
    departure_time: string
    arrival_date: string
    arrival_time: string
    duration_in_travel: number
    duration_waiting: number
    duration_total: number
  },
  timezone = "Europe/Warsaw",
) {
  return {
    user_trip: tripSlug,
    gtfs_trip: gtfs.gtfs_trip,
    starting_stop: fromLeg.stopId,
    destination_stop: toLeg.stopId,
    timezone,
    departure_date: gtfs.departure_date,
    departure_time: `${gtfs.departure_time}:00`.slice(0, 8),
    arrival_date: gtfs.arrival_date,
    arrival_time: `${gtfs.arrival_time}:00`.slice(0, 8),
    duration_in_travel: gtfs.duration_in_travel,
    duration_waiting: gtfs.duration_waiting,
    duration_total: gtfs.duration_total,
  }
}
