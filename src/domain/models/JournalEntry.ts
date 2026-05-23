import type { TripStopPhoto } from "./TripStopPhoto"

export type JournalEntryType = "arrival" | "meal" | "note" | "sight"

export class JournalEntry {
  readonly id: string
  readonly title: string
  readonly time: string
  readonly body: string
  readonly type: JournalEntryType
  readonly photos: TripStopPhoto[]
  readonly tags: string[]

  constructor(
    id: string,
    title: string,
    time: string,
    body: string,
    type: JournalEntryType,
    photos: TripStopPhoto[],
    tags: string[] = [],
  ) {
    this.id = id
    this.title = title
    this.time = time
    this.body = body
    this.type = type
    this.photos = photos
    this.tags = tags
  }

  get hasPhotos(): boolean {
    return this.photos.length > 0
  }
}
