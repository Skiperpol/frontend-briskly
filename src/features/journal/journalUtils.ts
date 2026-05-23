import type { JournalEntry } from "@/domain/models"

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

export function toEditableNote(entry: JournalEntry): EditableNote {
  return {
    id: entry.id,
    scheduleStopId: entry.scheduleStopId,
    day: entry.day,
    time: entry.time,
    title: entry.title,
    body: entry.body,
    sortOrder: entry.sortOrder,
    photos: entry.photos.map((photo) => ({
      id: photo.id,
      imageUrl: photo.imageUrl,
      userDescription: photo.userDescription,
      caption: photo.caption,
    })),
  }
}

export function sortNotes(notes: EditableNote[]): EditableNote[] {
  return [...notes].sort((a, b) => a.sortOrder - b.sortOrder)
}

export function notesForStop(notes: EditableNote[], stopId: string): EditableNote[] {
  return sortNotes(notes.filter((note) => note.scheduleStopId === stopId))
}
