import type { ScheduleStop, ScheduleStopTiming } from "@/domain/models/ScheduleStop"

export type ScheduleDayGroup = {
  date: string
  dayNumber: number
  stops: ScheduleStop[]
}

const dayMonthFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
})

function parseIsoDate(value: string): Date | null {
  const parsed = new Date(`${value}T12:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatDayMonth(value: string): string {
  const parsed = parseIsoDate(value)
  if (!parsed) return value
  return dayMonthFormatter.format(parsed)
}

export function computeStayDays(arrivalDate?: string, departureDate?: string): number | undefined {
  if (!arrivalDate || !departureDate) return undefined

  const arrival = parseIsoDate(arrivalDate)
  const departure = parseIsoDate(departureDate)
  if (!arrival || !departure) return undefined

  const diffMs = departure.getTime() - arrival.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)
  return Math.max(1, diffDays + 1)
}

export function formatScheduleDateRange(timing: ScheduleStopTiming): string | null {
  const { arrivalDate, departureDate } = timing

  if (arrivalDate && departureDate) {
    if (arrivalDate === departureDate) {
      return formatDayMonth(arrivalDate)
    }

    const arrival = parseIsoDate(arrivalDate)
    const departure = parseIsoDate(departureDate)
    if (
      arrival &&
      departure &&
      arrival.getMonth() === departure.getMonth() &&
      arrival.getFullYear() === departure.getFullYear()
    ) {
      const dayOnly = new Intl.DateTimeFormat("pl-PL", { day: "numeric" }).format(arrival)
      return `${dayOnly}–${formatDayMonth(departureDate)}`
    }

    return `${formatDayMonth(arrivalDate)} – ${formatDayMonth(departureDate)}`
  }

  if (arrivalDate) return formatDayMonth(arrivalDate)
  if (departureDate) return formatDayMonth(departureDate)
  return null
}

export function formatStayLabel(stayDays?: number): string | null {
  if (!stayDays) return null
  if (stayDays === 1) return null
  if (stayDays < 5) return `${stayDays} dni pobytu`
  return `${stayDays} dni pobytu`
}

function dateToIsoLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function computeTripDayNumber(tripStart: Date, isoDate: string): number {
  const start = parseIsoDate(dateToIsoLocal(tripStart))
  const target = parseIsoDate(isoDate)
  if (!start || !target) return 1

  const diffMs = target.getTime() - start.getTime()
  return Math.max(1, Math.floor(diffMs / 86_400_000) + 1)
}

function stopScheduleDate(stop: ScheduleStop): string | undefined {
  return stop.timing.arrivalDate ?? stop.timing.departureDate
}

export function groupScheduleStopsByDay(
  stops: ScheduleStop[],
  tripStart: Date,
): ScheduleDayGroup[] {
  if (stops.length === 0) return []

  const groups = new Map<string, ScheduleStop[]>()
  const orderedDates: string[] = []

  for (const stop of stops) {
    const date = stopScheduleDate(stop) ?? dateToIsoLocal(tripStart)

    if (!groups.has(date)) {
      groups.set(date, [])
      orderedDates.push(date)
    }

    groups.get(date)!.push(stop)
  }

  return orderedDates.map((date) => ({
    date,
    dayNumber: computeTripDayNumber(tripStart, date),
    stops: groups.get(date)!,
  }))
}

export function formatScheduleDayLabel(dayNumber: number, stops: ScheduleStop[]): string {
  const cities = stops.map((stop) => stop.subtitle.trim()).filter(Boolean)

  if (cities.length === 0) {
    return `Dzień ${dayNumber}`
  }

  const fromCity = cities[0]!
  const toCity = cities[cities.length - 1]!

  if (fromCity === toCity) {
    return `Dzień ${dayNumber}: ${fromCity}`
  }

  return `Dzień ${dayNumber}: ${fromCity} → ${toCity}`
}
