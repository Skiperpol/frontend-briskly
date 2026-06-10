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
        <div className="hidden items-center gap-2 sm:flex">
          <Button size="sm" className="gap-2" asChild>
            <Link to="/trasy">
              <ArrowLeft className="size-4" />
              Wszystkie trasy
            </Link>
          </Button>
          <TripDetailViewNav tripId={tripId} activeView="schedule" />
        </div>
      }
      trailing={
        <div className="grid w-full grid-cols-3 gap-2 sm:hidden">
          <Button
            size="sm"
            variant="outline"
            className="h-auto min-h-9 w-full flex-col gap-0.5 px-1 py-1.5 text-[10px] leading-tight"
            asChild
          >
            <Link to="/trasy">
              <ArrowLeft className="size-4 shrink-0" aria-hidden />
              Cofnij
            </Link>
          </Button>
          <TripDetailViewNav
            tripId={tripId}
            activeView="schedule"
            className="col-span-2"
          />
        </div>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <ScrollArea className="order-2 mt-3 w-full rounded-t-2xl border-t border-border bg-background shadow-[0_-4px_12px_rgba(0,0,0,0.04)] lg:order-1 lg:mt-0 lg:max-w-xl lg:min-h-0 lg:shrink-0 lg:rounded-none lg:border-r lg:border-t-0 lg:shadow-none">
          <div className="p-4 sm:p-6">
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
        <div className="order-1 shrink-0 px-4 pt-3 lg:order-2 lg:min-h-0 lg:flex-1 lg:px-0 lg:pt-0">
          <div className="relative h-[min(30vh,260px)] overflow-hidden rounded-xl border border-border bg-muted/30 shadow-sm lg:h-full lg:rounded-none lg:border-0 lg:bg-transparent lg:shadow-none">
            <ScheduleTripMap trip={trip} focusedStopId={focusedStopId} />
          </div>
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

