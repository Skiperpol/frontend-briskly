import type { JournalEntry } from "./JournalEntry"
import type { RouteLeg } from "./RouteLeg"
import type { ScheduleStop } from "./ScheduleStop"

export class UserTrip {
  readonly id: string
  readonly slug: string
  name: string
  readonly heroImageUrl: string
  readonly location: string
  readonly description: string
  readonly tags: string[]
  readonly startDate: Date
  readonly legs: RouteLeg[]
  readonly scheduleStops: ScheduleStop[]
  readonly journalEntries: JournalEntry[]
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
    this.finalizedAt = finalizedAt
  }

  get isFinalized(): boolean {
    return this.finalizedAt !== null
  }

  get dayLabel(): string {
    return "Dzień 4: Londyn → Paryż"
  }

  finalize(): void {
    this.finalizedAt = new Date()
  }
}
