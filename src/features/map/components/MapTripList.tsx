import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { cn } from "@/shared/lib/utils"
import type { UserTrip } from "@/domain/models/UserTrip"
import type { TripMapLayer } from "@/features/map/tripMapUtils"

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
                <button
                  type="button"
                  onClick={() => onSelectTrip(layer.tripId)}
                  className={cn(
                    "w-full rounded-lg border bg-card p-3 text-left transition-colors",
                    "hover:bg-muted/40",
                    isSelected && "bg-muted/50 shadow-sm",
                  )}
                  style={
                    isSelected
                      ? { borderColor: layer.color, borderWidth: 2 }
                      : undefined
                  }
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
