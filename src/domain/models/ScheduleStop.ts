import type { GeoPosition } from "./GeoPosition"

export type ScheduleStopKind = "flight" | "hotel" | "journal" | "dining" | "train" | "bus"

export type ScheduleStopTiming = {
  arrivalDate?: string
  arrivalTime?: string
  departureDate?: string
  departureTime?: string
  stayDays?: number
}

export type ScheduleStopCityInfo = {
  descriptionParagraphs?: string[]
  population?: number
}

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
  readonly position?: GeoPosition
  readonly timing: ScheduleStopTiming
  readonly cityInfo: ScheduleStopCityInfo

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
    position?: GeoPosition,
    timing: ScheduleStopTiming = {},
    cityInfo: ScheduleStopCityInfo = {},
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
    this.position = position
    this.timing = timing
    this.cityInfo = cityInfo
  }
}
