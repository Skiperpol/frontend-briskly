import type { UserTrip } from "@/domain/models"
import type { EditableNote } from "@/features/journal/types"
import { mapConnectionNotesToEditable } from "@/features/journal/journalUtils"
import type { PlannerRouteLeg } from "@/features/planner/types"
import { fetchDashboardStats as fetchDashboardStatsApi } from "@/shared/api/authApi"
import {
  connectionsToPlannerLegs,
  mapApiStatsToDashboardStats,
  mapApiTripToUserTrip,
} from "@/shared/api/mappers"
import type { ApiConnection, ApiNote, ApiTrip } from "@/shared/api/types"
import {
  getTrip,
  listConnectionNotes,
  listTripConnections,
  listTrips,
} from "@/shared/api/tripsApi"

import {
  clearPlannerDraftLegs,
  getPlannerDraftLegs,
  setPlannerDraftLegs,
} from "./plannerDrafts"

export type TripDetailBundle = {
  trip: UserTrip
  connections: ApiConnection[]
  notesByConnection: Map<number, ApiNote[]>
  editableNotes: EditableNote[]
}

export function getPlannerLegs(
  tripId: string,
  connections: ApiConnection[],
): PlannerRouteLeg[] {
  const draft = getPlannerDraftLegs(tripId)

  if (connections.length > 0) {
    const fromConnections = connectionsToPlannerLegs(connections)
    if (draft?.length === 1 && fromConnections.length === 0) {
      return draft
    }
    return fromConnections
  }

  return draft ?? []
}

async function buildTripDetailBundle(trip: ApiTrip): Promise<TripDetailBundle> {
  const connections = await listTripConnections(trip.slug)
  const notesByConnection = new Map<number, ApiNote[]>()

  for (const connection of connections) {
    const notes = await listConnectionNotes(connection.id)
    notesByConnection.set(connection.id, notes)
  }

  const userTrip = mapApiTripToUserTrip(trip, connections, notesByConnection)
  const editableNotes = connections.flatMap((connection) => {
    const notes = notesByConnection.get(connection.id) ?? []
    return mapConnectionNotesToEditable(connection, notes, userTrip.journalEntries)
  })

  return {
    trip: userTrip,
    connections,
    notesByConnection,
    editableNotes,
  }
}

export async function fetchTripsList(): Promise<TripDetailBundle[]> {
  const apiTrips = await listTrips()
  const bundles: TripDetailBundle[] = []

  for (const trip of apiTrips) {
    bundles.push(await buildTripDetailBundle(trip))
  }

  return bundles
}

export async function fetchTripDetail(slug: string): Promise<TripDetailBundle | undefined> {
  try {
    const apiTrip = await getTrip(slug)
    return buildTripDetailBundle(apiTrip)
  } catch {
    return undefined
  }
}

export async function loadDashboardStats() {
  const stats = await fetchDashboardStatsApi()
  return mapApiStatsToDashboardStats(stats)
}

export { clearPlannerDraftLegs, getPlannerDraftLegs, setPlannerDraftLegs }
