export class Destination {
  readonly id: string
  readonly city: string
  readonly country: string
  readonly matchPercent: number
  readonly travelTime: string
  readonly budgetLabel: string
  readonly description: string
  readonly imageUrl: string
  readonly featured: boolean
  readonly badge?: string

  constructor(
    id: string,
    city: string,
    country: string,
    matchPercent: number,
    travelTime: string,
    budgetLabel: string,
    description: string,
    imageUrl: string,
    featured: boolean = false,
    badge?: string,
  ) {
    this.id = id
    this.city = city
    this.country = country
    this.matchPercent = matchPercent
    this.travelTime = travelTime
    this.budgetLabel = budgetLabel
    this.description = description
    this.imageUrl = imageUrl
    this.featured = featured
    this.badge = badge
  }

  get fullName(): string {
    return `${this.city}, ${this.country}`
  }
}
