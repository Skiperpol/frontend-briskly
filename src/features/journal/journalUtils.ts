import type { ApiConnection, ApiNote } from "@/shared/api/types"
import type { JournalEntry, UserTrip } from "@/domain/models"
import { stopIdToConnectionId } from "@/shared/api/connectionUtils"
import { downloadJournalPdf } from "@/shared/api/tripsApi"

import type { EditableNote } from "./types"

export function getCurrentTimeValue(): string {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}`
}

export function formatNoteDay(day: string): string {
  if (!day) return ""
  const parsed = new Date(`${day}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return day
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed)
}

export function toEditableNote(
  entry: JournalEntry,
  connectionId: number,
  isImageOnly = false,
): EditableNote {
  return {
    id: entry.id,
    connectionId,
    scheduleStopId: entry.scheduleStopId,
    day: entry.day,
    time: entry.time,
    title: entry.title,
    body: entry.body,
    sortOrder: entry.sortOrder,
    isImageOnly,
    photos: entry.photos.map((photo) => ({
      id: photo.id,
      imageUrl: photo.imageUrl,
      userDescription: photo.userDescription,
      caption: photo.caption,
    })),
  }
}

export function mapConnectionNotesToEditable(
  connection: ApiConnection,
  notes: ApiNote[],
  journalEntries: JournalEntry[],
): EditableNote[] {
  const entryById = new Map(journalEntries.map((entry) => [entry.id, entry]))

  return notes.map((note) => {
    const entry = entryById.get(String(note.id))
    if (!entry) {
      throw new Error(`Brak wpisu dziennika dla notatki ${note.id}`)
    }
    const isImageOnly = Boolean(note.image_url && !note.html_source)
    return toEditableNote(entry, connection.id, isImageOnly)
  })
}

export function sortNotes(notes: EditableNote[]): EditableNote[] {
  return [...notes].sort((a, b) => a.sortOrder - b.sortOrder)
}

export function notesForStop(notes: EditableNote[], stopId: string): EditableNote[] {
  return sortNotes(notes.filter((note) => note.scheduleStopId === stopId))
}

export function buildJournalPdfFilename(tripName: string): string {
  const cleaned = tripName
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
  const label = cleaned.length > 0 ? cleaned : "Podróż"
  return `Briskly - ${label}.pdf`
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function exportJournalTripPdf(
  trip: Pick<UserTrip, "id" | "name">,
): Promise<void> {
  const blob = await downloadJournalPdf(trip.id)
  triggerBlobDownload(blob, buildJournalPdfFilename(trip.name))
}

export { stopIdToConnectionId }
