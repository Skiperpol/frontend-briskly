import type { ScheduleStopTiming } from "@/domain/models/ScheduleStop"

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
