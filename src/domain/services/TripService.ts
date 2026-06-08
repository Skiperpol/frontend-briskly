import {
  DashboardStats,
  UserTrip,
} from "@/domain/models"
import type { EditableNote } from "@/features/journal/types"
import { encodeEditableNotePayload } from "@/features/journal/journalNoteCodec"
import {
  mapConnectionNotesToEditable,
  notesForStop,
} from "@/features/journal/journalUtils"
import type { PlannerRouteLeg } from "@/features/planner/types"
import { stopIdToConnectionId } from "@/shared/api/connectionUtils"
import { fetchDashboardStats } from "@/shared/api/authApi"
import { findDestinationsFromStop } from "@/shared/api/logisticsApi"
import {
  connectionsToPlannerLegs,
  mapApiStatsToDashboardStats,
  mapApiTripToUserTrip,
  plannerLegsToCreateConnectionPayload,
} from "@/shared/api/mappers"
import type { ApiConnection, ApiNote, ApiTrip } from "@/shared/api/types"
import {
  createConnection,
  createConnectionNoteHtml,
  createConnectionNoteImage,
  createTrip,
  deleteConnection,
  deleteConnectionNote,
  finalizeTrip as apiFinalizeTrip,
  listConnectionNotes,
  listTripConnections,
  listTrips,
  reorderConnectionNotes,
  updateConnectionNoteHtml,
  updateTrip,
} from "@/shared/api/tripsApi"

export class TripService {
  private static instance: TripService | null = null

  private trips: UserTrip[] = []
  private apiTrips: ApiTrip[] = []
  private connectionsByTrip = new Map<string, ApiConnection[]>()
  private notesByTrip = new Map<string, Map<number, ApiNote[]>>()
  private plannerDraftLegs = new Map<string, PlannerRouteLeg[]>()
  private stats: DashboardStats | null = null
  private loaded = false
  private loading: Promise<void> | null = null

  private constructor() {}

  static getInstance(): TripService {
    if (!TripService.instance) {
      TripService.instance = new TripService()
    }
    return TripService.instance
  }

  async ensureLoaded(): Promise<void> {
    if (this.loaded) return
    if (this.loading) {
      await this.loading
      return
    }
    this.loading = this.refresh()
    await this.loading
    this.loading = null
  }

  async refresh(): Promise<void> {
    const [apiTrips, apiStats] = await Promise.all([listTrips(), fetchDashboardStats()])
    this.apiTrips = apiTrips
    this.stats = mapApiStatsToDashboardStats(apiStats)

    const trips = await Promise.all(
      apiTrips.map(async (trip) => this.buildUserTripFromApi(trip)),
    )

    this.trips = trips
    this.loaded = true
  }

  private async buildUserTripFromApi(trip: ApiTrip): Promise<UserTrip> {
    const connections = await listTripConnections(trip.slug)
    this.connectionsByTrip.set(trip.slug, connections)

    const notesByConnection = new Map<number, ApiNote[]>()
    if (connections.length > 0) {
      await Promise.all(
        connections.map(async (connection) => {
          const notes = await listConnectionNotes(connection.id)
          notesByConnection.set(connection.id, notes)
        }),
      )
    }
    this.notesByTrip.set(trip.slug, notesByConnection)

    return mapApiTripToUserTrip(trip, connections, notesByConnection)
  }

  async loadTripDetail(slug: string): Promise<UserTrip | undefined> {
    let apiTrip = this.apiTrips.find((trip) => trip.slug === slug)
    if (!apiTrip) {
      apiTrip = (await listTrips()).find((trip) => trip.slug === slug)
      if (apiTrip) {
        this.apiTrips.push(apiTrip)
      }
    }
    if (!apiTrip) return undefined

    const userTrip = await this.buildUserTripFromApi(apiTrip)
    const index = this.trips.findIndex((trip) => trip.id === slug)
    if (index >= 0) {
      this.trips[index] = userTrip
    } else {
      this.trips.push(userTrip)
    }
    return userTrip
  }

  getEditableJournalNotes(tripId: string): EditableNote[] {
    const trip = this.getTripById(tripId)
    const connections = this.connectionsByTrip.get(tripId) ?? []
    const notesByConnection = this.notesByTrip.get(tripId) ?? new Map()
    if (!trip) return []

    return connections.flatMap((connection) => {
      const notes = notesByConnection.get(connection.id) ?? []
      return mapConnectionNotesToEditable(connection, notes, trip.journalEntries)
    })
  }

  getConnections(tripId: string): ApiConnection[] {
    return this.connectionsByTrip.get(tripId) ?? []
  }

  async updateTripMetadata(
    tripId: string,
    payload: { name?: string; description?: string },
  ): Promise<UserTrip> {
    const updated = await updateTrip(tripId, payload)
    const index = this.apiTrips.findIndex((trip) => trip.slug === tripId)
    if (index >= 0) {
      this.apiTrips[index] = updated
    }
    const userTrip = await this.loadTripDetail(tripId)
    if (!userTrip) {
      throw new Error("Nie udało się odświeżyć podróży.")
    }
    return userTrip
  }

  async addJournalNote(
    tripId: string,
    scheduleStopId: string,
    partial: Omit<EditableNote, "id" | "sortOrder" | "scheduleStopId" | "connectionId">,
  ): Promise<EditableNote[]> {
    const connections = this.getConnections(tripId)
    const connectionId = stopIdToConnectionId(scheduleStopId, connections)
    if (!connectionId) {
      throw new Error("Nie znaleziono połączenia dla wybranego przystanku.")
    }

    if (partial.body.trim()) {
      await createConnectionNoteHtml(
        connectionId,
        encodeEditableNotePayload({
          title: partial.title,
          body: partial.body.trim(),
          day: partial.day,
          time: partial.time,
          scheduleStopId,
        }),
      )
    }

    for (const photo of partial.photos) {
      if (photo.file) {
        await createConnectionNoteImage(connectionId, photo.file)
      }
    }

    await this.loadTripDetail(tripId)
    return notesForStop(this.getEditableJournalNotes(tripId), scheduleStopId)
  }

  async updateJournalNote(tripId: string, note: EditableNote): Promise<void> {
    if (note.isImageOnly) {
      throw new Error("Edycja zdjęć nie jest jeszcze obsługiwana.")
    }

    await updateConnectionNoteHtml(
      note.connectionId,
      Number(note.id),
      encodeEditableNotePayload({
        title: note.title,
        body: note.body.trim(),
        day: note.day,
        time: note.time,
        scheduleStopId: note.scheduleStopId,
      }),
    )
    await this.loadTripDetail(tripId)
  }

  async deleteJournalNote(tripId: string, note: EditableNote): Promise<void> {
    await deleteConnectionNote(note.connectionId, Number(note.id))
    await this.loadTripDetail(tripId)
  }

  async reorderJournalNotes(
    tripId: string,
    scheduleStopId: string,
    reordered: EditableNote[],
  ): Promise<void> {
    const connectionId = stopIdToConnectionId(scheduleStopId, this.getConnections(tripId))
    if (!connectionId) return

    const order = Object.fromEntries(
      reordered.map((note, index) => [String(note.id), index]),
    )
    await reorderConnectionNotes(connectionId, order)
    await this.loadTripDetail(tripId)
  }

  getJournalTrips(): UserTrip[] {
    return [...this.trips]
  }

  getTripById(id: string): UserTrip | undefined {
    return this.trips.find((trip) => trip.id === id)
  }

  getPlanningTrips(): UserTrip[] {
    return this.trips.filter((trip) => !trip.isFinalized)
  }

  async createPlanningTrip(): Promise<UserTrip> {
    const created = await createTrip({ name: "Nowa podróż" })
    this.apiTrips.unshift(created)
    this.connectionsByTrip.set(created.slug, [])
    this.plannerDraftLegs.set(created.slug, [])

    const userTrip = mapApiTripToUserTrip(created, [], new Map())
    this.trips.unshift(userTrip)
    return userTrip
  }

  getPlannerLegs(tripId: string): PlannerRouteLeg[] {
    const draft = this.plannerDraftLegs.get(tripId)
    const connections = this.connectionsByTrip.get(tripId) ?? []

    if (connections.length > 0) {
      const fromConnections = connectionsToPlannerLegs(connections)
      if (draft?.length === 1 && fromConnections.length === 0) {
        return draft
      }
      return fromConnections
    }

    return draft ?? []
  }

  async savePlannerLegs(tripId: string, legs: PlannerRouteLeg[]): Promise<void> {
    if (legs.length < 2) {
      this.plannerDraftLegs.set(tripId, legs)
      const existing = this.connectionsByTrip.get(tripId) ?? []
      await Promise.all(existing.map((connection) => deleteConnection(connection.id)))
      this.connectionsByTrip.set(tripId, [])
      await this.loadTripDetail(tripId)
      return
    }

    this.plannerDraftLegs.delete(tripId)
    await this.syncPlannerConnections(tripId, legs)
    await this.loadTripDetail(tripId)
  }

  private async syncPlannerConnections(tripSlug: string, legs: PlannerRouteLeg[]): Promise<void> {
    const existing = [...(this.connectionsByTrip.get(tripSlug) ?? [])]
    const targetCount = legs.length - 1

    while (existing.length > targetCount) {
      const connection = existing.pop()!
      await deleteConnection(connection.id)
    }

    for (let index = 0; index < targetCount; index += 1) {
      const from = legs[index]!
      const to = legs[index + 1]!
      const current = existing[index]

      if (
        current &&
        current.starting_stop.stop_id === from.stopId &&
        current.destination_stop.stop_id === to.stopId
      ) {
        continue
      }

      if (current) {
        await deleteConnection(current.id)
        existing.splice(index, 1)
      }

      const destinations = await findDestinationsFromStop({
        fromStop: from.stopId,
        date: to.date,
        time: to.time,
        waitingTimeSeconds: 3600,
        timezone: "Europe/Warsaw",
        limit: 100,
      })

      const match = destinations.connections.find(
        (connection) => connection.destination_stop_id === to.stopId,
      )

      if (!match) {
        throw new Error(
          `Brak połączenia Flixbus z ${from.stopName} do ${to.stopName} w wybranym terminie.`,
        )
      }

      await createConnection(
        plannerLegsToCreateConnectionPayload(tripSlug, from, to, {
          gtfs_trip: match.trip_id,
          arrival_date: match.arrival_date,
          arrival_time: match.arrival_time,
          duration_in_travel: match.duration_in_travel,
          duration_waiting: match.duration_waiting,
          duration_total: match.duration_total,
        }),
      )
    }

    const refreshed = await listTripConnections(tripSlug)
    this.connectionsByTrip.set(tripSlug, refreshed)
  }

  async finalizeTrip(tripId: string): Promise<boolean> {
    const legs = this.getPlannerLegs(tripId)
    if (legs.length < 2) return false

    await this.savePlannerLegs(tripId, legs)
    const updated = await apiFinalizeTrip(tripId)
    const apiIndex = this.apiTrips.findIndex((trip) => trip.slug === tripId)
    if (apiIndex >= 0) {
      this.apiTrips[apiIndex] = updated
    }
    await this.loadTripDetail(tripId)
    this.plannerDraftLegs.delete(tripId)
    return true
  }

  getStats(): DashboardStats {
    if (this.stats) return this.stats
    return mapApiStatsToDashboardStats({
      countries_visited: 0,
      countries_delta: "",
      total_kilometers: "0 km",
      kilometers_delta: "",
      expeditions: 0,
      expeditions_delta: "",
      photos_taken: 0,
      daily_pace: "—",
      temperature: "—",
      altitude: "—",
      trips_total: 0,
    })
  }

  getActiveTrip(): UserTrip {
    return this.trips[0] ?? this.createEmptyTrip()
  }

  private createEmptyTrip(): UserTrip {
    return new UserTrip(
      "empty",
      "empty",
      "Brak podróży",
      "",
      "",
      "",
      [],
      new Date(),
      [],
      [],
      [],
      null,
      [],
    )
  }
}
