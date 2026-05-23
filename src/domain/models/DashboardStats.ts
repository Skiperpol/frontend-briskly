export class DashboardStats {
  readonly countriesVisited: number
  readonly countriesDelta: string
  readonly totalKilometers: string
  readonly kilometersDelta: string
  readonly expeditions: number
  readonly expeditionsDelta: string
  readonly photosTaken: number
  readonly dailyPace: string
  readonly temperature: string
  readonly altitude: string

  constructor(
    countriesVisited: number,
    countriesDelta: string,
    totalKilometers: string,
    kilometersDelta: string,
    expeditions: number,
    expeditionsDelta: string,
    photosTaken: number,
    dailyPace: string,
    temperature: string,
    altitude: string,
  ) {
    this.countriesVisited = countriesVisited
    this.countriesDelta = countriesDelta
    this.totalKilometers = totalKilometers
    this.kilometersDelta = kilometersDelta
    this.expeditions = expeditions
    this.expeditionsDelta = expeditionsDelta
    this.photosTaken = photosTaken
    this.dailyPace = dailyPace
    this.temperature = temperature
    this.altitude = altitude
  }
}
