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
import type { TripDetailBundle } from "@/domain/trips/tripLoader"
import type { EditableNote } from "@/features/journal/types"
import type { PlannerRouteLeg } from "@/features/planner/types"
import { queryKeys } from "@/shared/api/queryKeys"

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
  const invalidate = useInvalidateTrips()

  return useMutation({
    mutationFn: ({
      scheduleStopId,
      partial,
    }: {
      scheduleStopId: string
      partial: Omit<EditableNote, "id" | "sortOrder" | "scheduleStopId" | "connectionId">
    }) => addJournalNote(tripId, scheduleStopId, partial),
    onSuccess: () => invalidate(tripId),
  })
}

export function useUpdateJournalNoteMutation(tripId: string) {
  const invalidate = useInvalidateTrips()

  return useMutation({
    mutationFn: (note: EditableNote) => updateJournalNote(tripId, note),
    onSuccess: () => invalidate(tripId),
  })
}

export function useDeleteJournalNoteMutation(tripId: string) {
  const invalidate = useInvalidateTrips()

  return useMutation({
    mutationFn: (note: EditableNote) => deleteJournalNote(tripId, note),
    onSuccess: () => invalidate(tripId),
  })
}

export function useReorderJournalNotesMutation(tripId: string) {
  const invalidate = useInvalidateTrips()

  return useMutation({
    mutationFn: ({
      scheduleStopId,
      reordered,
    }: {
      scheduleStopId: string
      reordered: EditableNote[]
    }) => reorderJournalNotes(tripId, scheduleStopId, reordered),
    onSuccess: () => invalidate(tripId),
  })
}
