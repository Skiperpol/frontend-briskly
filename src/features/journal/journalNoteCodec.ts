const NOTE_PREFIX = "<!--briskly-note:v1-->"

export type EncodedNotePayload = {
  title: string
  body: string
  day: string
  time: string
  scheduleStopId: string
}

export function encodeEditableNotePayload(note: EncodedNotePayload): string {
  return `${NOTE_PREFIX}${JSON.stringify(note)}`
}

export function decodeNoteHtml(html: string): EncodedNotePayload | null {
  if (!html.startsWith(NOTE_PREFIX)) return null
  try {
    return JSON.parse(html.slice(NOTE_PREFIX.length)) as EncodedNotePayload
  } catch {
    return null
  }
}
