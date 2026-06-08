import type { ApiConnection, ApiNote, ApiTrip } from "@/shared/api/types"
import { apiDownload, apiRequest } from "@/shared/api/client"

export async function listTrips(): Promise<ApiTrip[]> {
  return apiRequest<ApiTrip[]>("/trips/")
}

export async function createTrip(payload: Partial<ApiTrip> = {}): Promise<ApiTrip> {
  return apiRequest<ApiTrip>("/trips/", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function getTrip(slug: string): Promise<ApiTrip> {
  return apiRequest<ApiTrip>(`/trips/${slug}/`)
}

export async function updateTrip(slug: string, payload: Partial<ApiTrip>): Promise<ApiTrip> {
  return apiRequest<ApiTrip>(`/trips/${slug}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export async function deleteTrip(slug: string): Promise<void> {
  await apiRequest<void>(`/trips/${slug}/`, { method: "DELETE" })
}

export async function downloadJournalPdf(slug: string): Promise<Blob> {
  return apiDownload(`/trips/${slug}/journal/pdf/`)
}

export async function finalizeTrip(slug: string): Promise<ApiTrip> {
  return apiRequest<ApiTrip>(`/trips/${slug}/finalize/`, { method: "POST" })
}

export async function listTripConnections(slug: string): Promise<ApiConnection[]> {
  return apiRequest<ApiConnection[]>(`/trips/${slug}/connections/`)
}

export type CreateConnectionPayload = {
  user_trip: string
  gtfs_trip: string
  starting_stop: string
  destination_stop: string
  timezone: string
  departure_date: string
  departure_time: string
  arrival_date: string
  arrival_time: string
  duration_in_travel: number
  duration_waiting: number
  duration_total: number
}

export type PatchConnectionPayload = Partial<CreateConnectionPayload>

export async function createConnection(payload: CreateConnectionPayload): Promise<ApiConnection> {
  return apiRequest<ApiConnection>("/connections/", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function patchConnection(
  connectionId: number,
  payload: PatchConnectionPayload,
): Promise<ApiConnection> {
  return apiRequest<ApiConnection>(`/connections/${connectionId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export async function deleteConnection(connectionId: number): Promise<void> {
  await apiRequest<void>(`/connections/${connectionId}/`, { method: "DELETE" })
}

export async function listConnectionNotes(connectionId: number): Promise<ApiNote[]> {
  return apiRequest<ApiNote[]>(`/connections/${connectionId}/notes/`)
}

export async function createConnectionNoteHtml(
  connectionId: number,
  htmlSource: string,
): Promise<ApiNote> {
  return apiRequest<ApiNote>(`/connections/${connectionId}/notes/`, {
    method: "POST",
    body: JSON.stringify({ html_source: htmlSource }),
  })
}

export async function createConnectionNoteImage(
  connectionId: number,
  image: File,
): Promise<ApiNote> {
  const formData = new FormData()
  formData.append("image", image)
  return apiRequest<ApiNote>(`/connections/${connectionId}/notes/`, {
    method: "POST",
    body: formData,
  })
}

export async function updateConnectionNoteHtml(
  connectionId: number,
  noteId: number,
  htmlSource: string,
): Promise<ApiNote> {
  return apiRequest<ApiNote>(`/connections/${connectionId}/notes/${noteId}/`, {
    method: "PATCH",
    body: JSON.stringify({ html_source: htmlSource }),
  })
}

export async function deleteConnectionNote(
  connectionId: number,
  noteId: number,
): Promise<void> {
  await apiRequest<void>(`/connections/${connectionId}/notes/${noteId}/`, {
    method: "DELETE",
  })
}

export async function reorderConnectionNotes(
  connectionId: number,
  order: Record<string, number>,
): Promise<ApiNote[]> {
  return apiRequest<ApiNote[]>(`/connections/${connectionId}/notes/reorder/`, {
    method: "PATCH",
    body: JSON.stringify(order),
  })
}
