export class TravelLog {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly monthLabel: string
  readonly imageUrl: string
  liked: boolean

  constructor(
    id: string,
    title: string,
    description: string,
    monthLabel: string,
    imageUrl: string,
    liked: boolean = false,
  ) {
    this.id = id
    this.title = title
    this.description = description
    this.monthLabel = monthLabel
    this.imageUrl = imageUrl
    this.liked = liked
  }

  toggleLike(): void {
    this.liked = !this.liked
  }
}
