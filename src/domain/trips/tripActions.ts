import type { EditableNote } from "@/features/journal/types"
import { encodeEditableNotePayload } from "@/features/journal/journalNoteCodec"
import { notesForStop } from "@/features/journal/journalUtils"
import type { PlannerRouteLeg } from "@/features/planner/types"
import { stopIdToConnectionId } from "@/shared/api/connectionUtils"
import { findDestinationsFromStop } from "@/shared/api/logisticsApi"
import {
  mapApiTripToUserTrip,
  plannerLegsToCreateConnectionPayload,
} from "@/shared/api/mappers"
import {
  createConnection,
  createConnectionNoteHtml,
  createConnectionNoteImage,
  createTrip,
  deleteConnection,
  deleteConnectionNote,
  deleteTrip,
  finalizeTrip as apiFinalizeTrip,
  listTripConnections,
  reorderConnectionNotes,
  updateConnectionNoteHtml,
  updateTrip,
} from "@/shared/api/tripsApi"

import { clearPlannerDraftLegs, setPlannerDraftLegs } from "./plannerDrafts"
import { fetchTripDetail, getPlannerLegs, type TripDetailBundle } from "./tripLoader"

export async function deletePlanningTrip(tripId: string): Promise<void> {
  await deleteTrip(tripId)
  clearPlannerDraftLegs(tripId)
}

export async function createPlanningTrip(): Promise<TripDetailBundle> {
  const created = await createTrip({ name: "Nowa podróż" })
  setPlannerDraftLegs(created.slug, [])
  const trip = mapApiTripToUserTrip(created, [], new Map())

  return {
    trip,
    connections: [],
    notesByConnection: new Map(),
    editableNotes: [],
  }
}

export async function updateTripMetadata(
  tripId: string,
  payload: { name?: string; description?: string },
) {
  await updateTrip(tripId, payload)
  const bundle = await fetchTripDetail(tripId)
  if (!bundle) {
    throw new Error("Nie udało się odświeżyć podróży.")
  }
  return bundle.trip
}

export async function addJournalNote(
  tripId: string,
  scheduleStopId: string,
  partial: Omit<EditableNote, "id" | "sortOrder" | "scheduleStopId" | "connectionId">,
) {
  const bundle = await fetchTripDetail(tripId)
  if (!bundle) {
    throw new Error("Nie znaleziono podróży.")
  }

  const connectionId = stopIdToConnectionId(scheduleStopId, bundle.connections)
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

  const refreshed = await fetchTripDetail(tripId)
  if (!refreshed) return []
  return notesForStop(refreshed.editableNotes, scheduleStopId)
}

export async function updateJournalNote(tripId: string, note: EditableNote) {
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
  await fetchTripDetail(tripId)
}

export async function deleteJournalNote(_tripId: string, note: EditableNote) {
  await deleteConnectionNote(note.connectionId, Number(note.id))
}

export async function reorderJournalNotes(
  tripId: string,
  scheduleStopId: string,
  reordered: EditableNote[],
) {
  const bundle = await fetchTripDetail(tripId)
  if (!bundle) return

  const connectionId = stopIdToConnectionId(scheduleStopId, bundle.connections)
  if (!connectionId) return

  const order = Object.fromEntries(
    reordered.map((note, index) => [String(note.id), index]),
  )
  await reorderConnectionNotes(connectionId, order)
}

async function syncPlannerConnections(tripSlug: string, legs: PlannerRouteLeg[]) {
  const existing = await listTripConnections(tripSlug)
  const targetCount = legs.length - 1
  const mutable = [...existing]

  while (mutable.length > targetCount) {
    const connection = mutable.pop()!
    await deleteConnection(connection.id)
  }

  for (let index = 0; index < targetCount; index += 1) {
    const from = legs[index]!
    const to = legs[index + 1]!
    const current = mutable[index]

    if (
      current &&
      current.starting_stop.stop_id === from.stopId &&
      current.destination_stop.stop_id === to.stopId
    ) {
      continue
    }

    if (current) {
      await deleteConnection(current.id)
      mutable.splice(index, 1)
    }

    if (to.connectionMeta?.gtfs_trip) {
      await createConnection(
        plannerLegsToCreateConnectionPayload(tripSlug, from, to, to.connectionMeta),
      )
      continue
    }

    const searchMeta = to.connectionMeta
    const destinations = await findDestinationsFromStop({
      fromStop: from.stopId,
      date: searchMeta?.searchReadyDate ?? from.date,
      time: (searchMeta?.searchReadyTime ?? from.time).slice(0, 5),
      waitingTimeSeconds: searchMeta?.searchWaitingSeconds ?? 3600,
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
        departure_date: match.departure_date,
        departure_time: match.departure_time,
        arrival_date: match.arrival_date,
        arrival_time: match.arrival_time,
        duration_in_travel: match.duration_in_travel,
        duration_waiting: match.duration_waiting,
        duration_total: match.duration_total,
      }),
    )
  }
}

export async function savePlannerLegs(tripId: string, legs: PlannerRouteLeg[]) {
  if (legs.length < 2) {
    setPlannerDraftLegs(tripId, legs)
    const existing = await listTripConnections(tripId)
    await Promise.all(existing.map((connection) => deleteConnection(connection.id)))
    return
  }

  clearPlannerDraftLegs(tripId)
  await syncPlannerConnections(tripId, legs)
}

export async function finalizeTrip(tripId: string) {
  const bundle = await fetchTripDetail(tripId)
  if (!bundle) return false

  const legs = getPlannerLegs(tripId, bundle.connections)
  if (legs.length < 2) return false

  await savePlannerLegs(tripId, legs)
  await apiFinalizeTrip(tripId)
  clearPlannerDraftLegs(tripId)
  return true
}
