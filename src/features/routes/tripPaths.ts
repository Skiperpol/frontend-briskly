export function tripJournalPath(tripId: string): string {
  return `/trasy/${tripId}/dziennik`
}

export function tripSchedulePath(tripId: string): string {
  return `/trasy/${tripId}/harmonogram`
}
