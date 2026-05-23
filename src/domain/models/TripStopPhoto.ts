export class TripStopPhoto {
  readonly id: string
  readonly imageUrl: string
  userDescription: string
  readonly caption: string
  readonly createdAt: Date

  constructor(
    id: string,
    imageUrl: string,
    userDescription: string,
    caption: string,
    createdAt: Date = new Date(),
  ) {
    this.id = id
    this.imageUrl = imageUrl
    this.userDescription = userDescription
    this.caption = caption
    this.createdAt = createdAt
  }

  updateDescription(description: string): void {
    this.userDescription = description
  }
}
