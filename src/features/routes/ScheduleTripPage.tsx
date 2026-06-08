import { useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { ArrowLeft, Bus } from "lucide-react"

import type { ScheduleStop, UserTrip } from "@/domain/models"
import { useTrip } from "@/shared/hooks/useTrip"
import { ScheduleTripMap } from "@/features/routes/components/ScheduleTripMap"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { PageLayout } from "@/shared/components/layout/PageLayout"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { cn } from "@/shared/lib/utils"

const TIMELINE_ICON_CLASS = "bg-sky-100 text-sky-600"

export function ScheduleTripPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { trip, loading } = useTrip(tripId)
  const [focusedStopId, setFocusedStopId] = useState<string | null>(null)

  if (loading) {
    return (
      <PageLayout>
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Ładowanie harmonogramu…
        </div>
      </PageLayout>
    )
  }

  if (!trip) {
    return <Navigate to="/trasy" replace />
  }

  return (
    <PageLayout
      action={
        <Button size="sm" className="gap-2" asChild>
          <Link to="/trasy">
            <ArrowLeft className="size-4" />
            Wszystkie trasy
          </Link>
        </Button>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <ScrollArea className="w-full shrink-0 lg:max-w-xl lg:border-r lg:border-border">
          <div className="p-6">
            <ScheduleHeaderCard
              trip={trip}
              selected={focusedStopId === null}
              onSelect={() => setFocusedStopId(null)}
            />
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {trip.dayLabel}
            </p>
            <div className="relative">
              <div
                className="absolute top-3.5 bottom-3.5 left-3.5 w-px -translate-x-1/2 bg-border"
                aria-hidden
              />
              {trip.scheduleStops.map((stop) => (
                <ScheduleStopCard
                  key={stop.id}
                  stop={stop}
                  selected={focusedStopId === stop.id}
                  onSelect={() => setFocusedStopId(stop.id)}
                />
              ))}
            </div>
          </div>
        </ScrollArea>
        <div className="relative min-h-[min(50vh,420px)] min-w-0 flex-1 lg:min-h-0">
          <ScheduleTripMap trip={trip} focusedStopId={focusedStopId} />
        </div>
      </div>
    </PageLayout>
  )
}

function ScheduleHeaderCard({
  trip,
  selected,
  onSelect,
}: {
  trip: UserTrip
  selected: boolean
  onSelect: () => void
}) {
  return (
    <Card
      className={cn(
        "mb-6 cursor-pointer py-4 transition-shadow hover:shadow-md",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect()
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${trip.name} — pokaż całą trasę na mapie`}
    >
      <CardContent className="space-y-1 px-4 py-0">
        <h2 className="text-lg font-semibold leading-tight">{trip.name}</h2>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Harmonogram podróży
        </p>
      </CardContent>
    </Card>
  )
}

function ScheduleStopCard({
  stop,
  selected,
  onSelect,
}: {
  stop: ScheduleStop
  selected: boolean
  onSelect: () => void
}) {
  const hasMapPosition = Boolean(stop.position)
  const isInteractive = hasMapPosition

  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      <div
        className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-background ${TIMELINE_ICON_CLASS}`}
      >
        <Bus className="size-3.5" aria-hidden />
      </div>
      <Card
        className={cn(
          "flex-1 py-3 transition-shadow",
          isInteractive && "cursor-pointer hover:shadow-md",
          selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          !isInteractive && "opacity-90",
        )}
        onClick={isInteractive ? onSelect : undefined}
        onKeyDown={
          isInteractive
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  onSelect()
                }
              }
            : undefined
        }
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        aria-pressed={isInteractive ? selected : undefined}
        aria-label={
          isInteractive
            ? `${stop.title}, ${stop.subtitle} — pokaż na mapie`
            : undefined
        }
      >
        <CardContent className="space-y-2 px-4 py-0">
          <p className="text-[10px] font-medium text-muted-foreground">{stop.time}</p>
          <p className="font-semibold">{stop.title}</p>
          <p className="text-sm text-muted-foreground">{stop.subtitle}</p>
          {stop.imageUrl && (
            <img
              src={stop.imageUrl}
              alt=""
              className="h-20 w-full rounded-lg object-cover"
            />
          )}
          {stop.journalSnippet && (
            <p className="rounded-lg bg-muted/80 p-2 text-xs italic text-muted-foreground">
              &ldquo;{stop.journalSnippet}&rdquo;
            </p>
          )}
          {Object.entries(stop.details).length > 0 && (
            <dl className="grid grid-cols-2 gap-1 text-xs">
              {Object.entries(stop.details).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-muted-foreground">{key}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          )}
          {stop.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {stop.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
