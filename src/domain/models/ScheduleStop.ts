export type ScheduleStopKind = "flight" | "hotel" | "journal" | "dining" | "train" | "bus"

export class ScheduleStop {
  readonly id: string
  readonly kind: ScheduleStopKind
  readonly time: string
  readonly title: string
  readonly subtitle: string
  readonly details: Record<string, string>
  readonly imageUrl?: string
  readonly journalSnippet?: string
  readonly tags: string[]

  constructor(
    id: string,
    kind: ScheduleStopKind,
    time: string,
    title: string,
    subtitle: string,
    details: Record<string, string> = {},
    imageUrl?: string,
    journalSnippet?: string,
    tags: string[] = [],
  ) {
    this.id = id
    this.kind = kind
    this.time = time
    this.title = title
    this.subtitle = subtitle
    this.details = details
    this.imageUrl = imageUrl
    this.journalSnippet = journalSnippet
    this.tags = tags
  }
}
