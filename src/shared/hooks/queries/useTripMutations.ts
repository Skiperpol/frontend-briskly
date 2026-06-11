import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  addJournalNote,
  createPlanningTrip,
  deleteJournalNote,
  deletePlanningTrip,
  finalizeTrip,
  reorderJournalNotes,
  savePlannerLegs,
  updateJournalNote,
  updateTripMetadata,
} from "@/domain/trips/tripActions"
import { patchConnectionNotes, type TripDetailBundle } from "@/domain/trips/tripLoader"
import { UserTrip } from "@/domain/models"
import type { EditableNote } from "@/features/journal/types"
import type { PlannerRouteLeg } from "@/features/planner/types"
import { queryKeys } from "@/shared/api/queryKeys"
import type { ApiNote } from "@/shared/api/types"

function useInvalidateTrips() {
  const queryClient = useQueryClient()

  return (tripId?: string) => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.trips.all })
    void queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard() })
    if (tripId) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trips.detail(tripId) })
    }
  }
}

function cloneTripWithEntryCount(trip: UserTrip, journalEntryCount: number): UserTrip {
  return new UserTrip(
    trip.id,
    trip.slug,
    trip.name,
    trip.heroImageUrl,
    trip.location,
    trip.description,
    trip.tags,
    trip.startDate,
    trip.legs,
    trip.scheduleStops,
    trip.journalEntries,
    trip.finalizedAt,
    trip.mapPath,
    journalEntryCount,
  )
}

function useJournalNoteCache(tripId: string) {
  const queryClient = useQueryClient()

  const patchNotes = (connectionId: number, notes: ApiNote[]) => {
    queryClient.setQueryData<TripDetailBundle>(queryKeys.trips.detail(tripId), (current) => {
      if (!current) return current
      return patchConnectionNotes(current, connectionId, notes)
    })

    queryClient.setQueryData<TripDetailBundle[]>(queryKeys.trips.list(), (current) => {
      if (!current) return current
      const detail = queryClient.getQueryData<TripDetailBundle>(queryKeys.trips.detail(tripId))
      const entryCount = detail?.trip.journalEntryCount
      if (entryCount === undefined) return current

      return current.map((bundle) =>
        bundle.trip.id === tripId
          ? { ...bundle, trip: cloneTripWithEntryCount(bundle.trip, entryCount) }
          : bundle,
      )
    })
  }

  const appendNotes = (connectionId: number, createdNotes: ApiNote[]) => {
    const current = queryClient.getQueryData<TripDetailBundle>(queryKeys.trips.detail(tripId))
    if (!current) return

    const existing = current.notesByConnection.get(connectionId) ?? []
    patchNotes(connectionId, [...existing, ...createdNotes])
  }

  const removeNote = (note: EditableNote) => {
    const current = queryClient.getQueryData<TripDetailBundle>(queryKeys.trips.detail(tripId))
    if (!current) return

    const existing = current.notesByConnection.get(note.connectionId) ?? []
    patchNotes(
      note.connectionId,
      existing.filter((item) => String(item.id) !== note.id),
    )
  }

  const replaceNote = (note: EditableNote, updatedNote: ApiNote) => {
    const current = queryClient.getQueryData<TripDetailBundle>(queryKeys.trips.detail(tripId))
    if (!current) return

    const existing = current.notesByConnection.get(note.connectionId) ?? []
    patchNotes(
      note.connectionId,
      existing.map((item) => (String(item.id) === note.id ? updatedNote : item)),
    )
  }

  return { patchNotes, appendNotes, removeNote, replaceNote }
}

export function useDeleteTripMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePlanningTrip,
    onSuccess: (_result, tripId) => {
      queryClient.removeQueries({ queryKey: queryKeys.trips.detail(tripId) })
      queryClient.setQueryData<TripDetailBundle[]>(queryKeys.trips.list(), (current) =>
        current ? current.filter((bundle) => bundle.trip.id !== tripId) : [],
      )
      void queryClient.invalidateQueries({ queryKey: queryKeys.trips.list() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard() })
    },
  })
}

export function useCreateTripMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPlanningTrip,
    onSuccess: (bundle) => {
      queryClient.setQueryData(queryKeys.trips.detail(bundle.trip.id), bundle)
      queryClient.setQueryData<TripDetailBundle[]>(queryKeys.trips.list(), (current) =>
        current ? [...current, bundle] : [bundle],
      )
      void queryClient.invalidateQueries({ queryKey: queryKeys.trips.list() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard() })
    },
  })
}

export function useUpdateTripMetadataMutation(tripId: string) {
  const invalidate = useInvalidateTrips()

  return useMutation({
    mutationFn: (payload: { name?: string; description?: string }) =>
      updateTripMetadata(tripId, payload),
    onSuccess: () => {
      invalidate(tripId)
    },
  })
}

export function useSavePlannerLegsMutation(tripId: string) {
  const invalidate = useInvalidateTrips()

  return useMutation({
    mutationFn: (legs: PlannerRouteLeg[]) => savePlannerLegs(tripId, legs),
    onSuccess: () => invalidate(tripId),
  })
}

export function useFinalizeTripMutation(tripId: string) {
  const invalidate = useInvalidateTrips()

  return useMutation({
    mutationFn: () => finalizeTrip(tripId),
    onSuccess: () => invalidate(tripId),
  })
}

export function useAddJournalNoteMutation(tripId: string) {
  const { appendNotes } = useJournalNoteCache(tripId)

  return useMutation({
    mutationFn: ({
      connectionId,
      scheduleStopId,
      partial,
    }: {
      connectionId: number
      scheduleStopId: string
      partial: Omit<EditableNote, "id" | "sortOrder" | "scheduleStopId" | "connectionId">
    }) => addJournalNote(connectionId, scheduleStopId, partial),
    onSuccess: (createdNotes, { connectionId }) => {
      appendNotes(connectionId, createdNotes)
    },
  })
}

export function useUpdateJournalNoteMutation(tripId: string) {
  const { replaceNote } = useJournalNoteCache(tripId)

  return useMutation({
    mutationFn: (note: EditableNote) => updateJournalNote(note),
    onSuccess: (updatedNote, note) => {
      replaceNote(note, updatedNote)
    },
  })
}

export function useDeleteJournalNoteMutation(tripId: string) {
  const queryClient = useQueryClient()
  const { removeNote } = useJournalNoteCache(tripId)

  return useMutation({
    mutationFn: (note: EditableNote) => deleteJournalNote(note),
    onMutate: async (note) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.trips.detail(tripId) })
      const previous = queryClient.getQueryData<TripDetailBundle>(queryKeys.trips.detail(tripId))
      removeNote(note)
      return { previous }
    },
    onError: (_error, _note, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.trips.detail(tripId), context.previous)
      }
    },
  })
}

export function useReorderJournalNotesMutation(tripId: string) {
  const { patchNotes } = useJournalNoteCache(tripId)

  return useMutation({
    mutationFn: ({
      connectionId,
      reordered,
    }: {
      connectionId: number
      reordered: EditableNote[]
    }) => reorderJournalNotes(connectionId, reordered),
    onSuccess: (notes, { connectionId }) => {
      patchNotes(connectionId, notes)
    },
  })
}
