export type ActivityKind = "flight" | "journal" | "booking"

export class ActivityItem {
  readonly id: string
  readonly kind: ActivityKind
  readonly title: string
  readonly description: string
  readonly meta?: string
  readonly tags: string[]
  readonly badge?: string

  constructor(
    id: string,
    kind: ActivityKind,
    title: string,
    description: string,
    meta?: string,
    tags: string[] = [],
    badge?: string,
  ) {
    this.id = id
    this.kind = kind
    this.title = title
    this.description = description
    this.meta = meta
    this.tags = tags
    this.badge = badge
  }
}
