export type TransportMode = "flight" | "train" | "bus"

export class RouteLeg {
  readonly id: string
  readonly mode: TransportMode
  readonly from: string
  readonly to: string
  readonly code: string
  readonly duration: string
  readonly meta: string
  readonly waitTime?: string

  constructor(
    id: string,
    mode: TransportMode,
    from: string,
    to: string,
    code: string,
    duration: string,
    meta: string,
    waitTime?: string,
  ) {
    this.id = id
    this.mode = mode
    this.from = from
    this.to = to
    this.code = code
    this.duration = duration
    this.meta = meta
    this.waitTime = waitTime
  }
}
