import { useTripQuery } from "@/shared/hooks/queries/useTripQuery"

export function useTrip(tripId: string | undefined) {
  const query = useTripQuery(tripId)

  return {
    trip: query.data?.trip,
    editableNotes: query.data?.editableNotes ?? [],
    connections: query.data?.connections ?? [],
    loading:
      query.isPending ||
      Boolean(query.data?.isSummary && (query.isFetching || query.isLoading)),
    error: query.error instanceof Error ? query.error.message : null,
    isFetching: query.isFetching,
  }
}
