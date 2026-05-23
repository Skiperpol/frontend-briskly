import type { TripStopPhoto } from "./TripStopPhoto"

export type JournalEntryType = "arrival" | "meal" | "note" | "sight"

export class JournalEntry {
  readonly id: string
  readonly scheduleStopId: string
  readonly day: string
  readonly title: string
  readonly time: string
  readonly body: string
  readonly type: JournalEntryType
  readonly photos: TripStopPhoto[]
  readonly sortOrder: number
  readonly tags: string[]

  constructor(
    id: string,
    scheduleStopId: string,
    day: string,
    title: string,
    time: string,
    body: string,
    type: JournalEntryType,
    photos: TripStopPhoto[],
    sortOrder: number = 0,
    tags: string[] = [],
  ) {
    this.id = id
    this.scheduleStopId = scheduleStopId
    this.day = day
    this.title = title
    this.time = time
    this.body = body
    this.type = type
    this.photos = photos
    this.sortOrder = sortOrder
    this.tags = tags
  }

  get hasPhotos(): boolean {
    return this.photos.length > 0
  }
}
