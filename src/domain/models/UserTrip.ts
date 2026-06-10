import type { GeoPosition } from "./GeoPosition"
import type { JournalEntry } from "./JournalEntry"
import type { RouteLeg } from "./RouteLeg"
import type { ScheduleStop } from "./ScheduleStop"

export class UserTrip {
  readonly id: string
  readonly slug: string
  name: string
  readonly heroImageUrl: string
  location: string
  readonly description: string
  readonly tags: string[]
  readonly startDate: Date
  legs: RouteLeg[]
  scheduleStops: ScheduleStop[]
  readonly journalEntries: JournalEntry[]
  readonly journalEntryCount: number
  mapPath: GeoPosition[]
  finalizedAt: Date | null

  constructor(
    id: string,
    slug: string,
    name: string,
    heroImageUrl: string,
    location: string,
    description: string,
    tags: string[],
    startDate: Date,
    legs: RouteLeg[],
    scheduleStops: ScheduleStop[],
    journalEntries: JournalEntry[],
    finalizedAt: Date | null = null,
    mapPath: GeoPosition[] = [],
    journalEntryCount?: number,
  ) {
    this.id = id
    this.slug = slug
    this.name = name
    this.heroImageUrl = heroImageUrl
    this.location = location
    this.description = description
    this.tags = tags
    this.startDate = startDate
    this.legs = legs
    this.scheduleStops = scheduleStops
    this.journalEntries = journalEntries
    this.journalEntryCount = journalEntryCount ?? journalEntries.length
    this.finalizedAt = finalizedAt
    this.mapPath = mapPath
  }

  get isFinalized(): boolean {
    return this.finalizedAt !== null
  }

  /** True when the planned trip's end date is before today. */
  get isCompleted(): boolean {
    if (!this.finalizedAt) return false

    const end = new Date(this.finalizedAt)
    end.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return end < today
  }

  get dayLabel(): string {
    return "Dzień 4: Londyn → Paryż"
  }

  finalize(): void {
    this.finalizedAt = new Date()
  }
}
