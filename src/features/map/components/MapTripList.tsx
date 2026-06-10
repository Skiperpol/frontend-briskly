import { BookOpen, CalendarDays } from "lucide-react"
import { Link } from "react-router-dom"

import type { UserTrip } from "@/domain/models/UserTrip"
import type { TripMapLayer } from "@/features/map/tripMapUtils"
import { tripJournalPath, tripSchedulePath } from "@/features/routes/tripPaths"
import { Button } from "@/shared/components/ui/button"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { cn } from "@/shared/lib/utils"

type MapTripListProps = {
  layers: TripMapLayer[]
  trips: UserTrip[]
  selectedTripId: string | null
  onSelectTrip: (tripId: string) => void
  tripCount: number
  totalKilometers: string
  className?: string
  emptyMessage?: string
}

export function MapTripList({
  layers,
  trips,
  selectedTripId,
  onSelectTrip,
  tripCount,
  totalKilometers,
  className,
  emptyMessage = "Brak tras do wyświetlenia na mapie.",
}: MapTripListProps) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <p className="shrink-0 text-sm font-semibold">Wycieczki</p>
      <ScrollArea className="mt-3 min-h-0 flex-1 scrollbar-gutter-auto">
        {layers.length === 0 ? (
          <p className="px-1 text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
        <ul className="space-y-2">
          {layers.map((layer) => {
            const trip = trips.find((item) => item.id === layer.tripId)
            const isSelected = selectedTripId === layer.tripId

            return (
              <li key={layer.tripId}>
                <div
                  className={cn(
                    "overflow-hidden rounded-lg border bg-card transition-colors",
                    isSelected && "bg-muted/50 shadow-sm",
                  )}
                  style={
                    isSelected
                      ? { borderColor: layer.color, borderWidth: 2 }
                      : undefined
                  }
                >
                  <button
                    type="button"
                    onClick={() => onSelectTrip(layer.tripId)}
                    className="w-full p-3 text-left transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-1 size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: layer.color }}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{layer.name}</p>
                        {trip?.location && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {trip.location}
                          </p>
                        )}
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {layer.stops.length} przystanków
                        </p>
                      </div>
                    </div>
                  </button>
                  {isSelected && (
                    <div className="grid grid-cols-2 gap-1.5 border-t border-border/60 px-3 py-2">
                      <Button
                        type="button"
                        size="sm"
                        className="h-auto min-h-7 flex-col gap-0.5 px-1 py-1.5 text-[10px] sm:h-7 sm:flex-row sm:gap-1 sm:px-2 sm:text-xs"
                        asChild
                      >
                        <Link to={tripSchedulePath(layer.tripId)}>
                          <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                          Harmonogram
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="h-auto min-h-7 flex-col gap-0.5 border-transparent bg-sky-400 px-1 py-1.5 text-[10px] text-white hover:bg-sky-500 sm:h-7 sm:flex-row sm:gap-1 sm:px-2 sm:text-xs dark:bg-sky-500 dark:hover:bg-sky-400"
                        asChild
                      >
                        <Link to={tripJournalPath(layer.tripId)}>
                          <BookOpen className="size-3.5 shrink-0" aria-hidden />
                          Dziennik
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
        )}
      </ScrollArea>

      <div className="mt-4 shrink-0 border-t border-sidebar-border pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Wycieczki
            </p>
            <p className="mt-1 text-lg font-bold">{tripCount}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Łączny dystans
            </p>
            <p className="mt-1 text-lg font-bold">{totalKilometers}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
