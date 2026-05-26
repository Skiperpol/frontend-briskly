import type { UserTrip } from "@/domain/models"

export function normalizeTripSearchQuery(query: string): string {
  return query.trim().toLowerCase()
}

export function matchesTripNameSearch(trip: UserTrip, query: string): boolean {
  const normalized = normalizeTripSearchQuery(query)
  if (!normalized) return true
  return trip.name.toLowerCase().includes(normalized)
}

export function filterTripsByName(trips: UserTrip[], query: string): UserTrip[] {
  return trips.filter((trip) => matchesTripNameSearch(trip, query))
}
