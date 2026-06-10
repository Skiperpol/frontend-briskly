import { useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import type { UserTrip } from "@/domain/models"
import { useTrip } from "@/shared/hooks/useTrip"
import { ScheduleStopCard } from "@/features/routes/components/ScheduleStopCard"
import { ScheduleTripMap } from "@/features/routes/components/ScheduleTripMap"
import { TripDetailViewNav } from "@/features/routes/components/TripDetailViewNav"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { PageLayout } from "@/shared/components/layout/PageLayout"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { cn } from "@/shared/lib/utils"

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

  if (!trip || !tripId) {
    return <Navigate to="/trasy" replace />
  }

  return (
    <PageLayout
      action={
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-2" asChild>
            <Link to="/trasy">
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Wszystkie trasy</span>
            </Link>
          </Button>
          <TripDetailViewNav tripId={tripId} activeView="schedule" />
        </div>
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

