import type { ApiConnection, ApiNote } from "@/shared/api/types"
import type { JournalEntry, UserTrip } from "@/domain/models"
import { stopIdToConnectionId } from "@/shared/api/connectionUtils"

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

export function exportJournalTrip(trip: UserTrip): void {
  const stopById = new Map(trip.scheduleStops.map((stop) => [stop.id, stop]))

  const payload = {
    id: trip.id,
    name: trip.name,
    location: trip.location,
    description: trip.description,
    startDate: trip.startDate.toISOString(),
    finalizedAt: trip.finalizedAt?.toISOString() ?? null,
    scheduleStops: trip.scheduleStops.map((stop) => ({
      id: stop.id,
      title: stop.title,
      subtitle: stop.subtitle,
      time: stop.time,
      kind: stop.kind,
    })),
    journalEntries: [...trip.journalEntries]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((entry) => ({
        id: entry.id,
        scheduleStopId: entry.scheduleStopId,
        scheduleStopTitle: stopById.get(entry.scheduleStopId)?.title ?? null,
        day: entry.day,
        time: entry.time,
        title: entry.title,
        body: entry.body,
        type: entry.type,
        photos: entry.photos.map((photo) => ({
          id: photo.id,
          caption: photo.caption,
          userDescription: photo.userDescription,
          imageUrl: photo.imageUrl,
        })),
      })),
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `${trip.slug}-dziennik.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export { stopIdToConnectionId }
