import { Bus, Loader2 } from "lucide-react"

import {
  formatDepartureIn,
  formatDurationSeconds,
  formatSchedule,
} from "@/features/planner/plannerConnectionUtils"
import type { PlannerConnectionOption } from "@/features/planner/types"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"

type PlannerConnectionsListProps = {
  items: PlannerConnectionOption[]
  loading?: boolean
  error?: string | null
  onSelect: (option: PlannerConnectionOption) => void
  onHover: (option: PlannerConnectionOption | null) => void
}

export function PlannerConnectionsList({
  items,
  loading = false,
  error = null,
  onSelect,
  onHover,
}: PlannerConnectionsListProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
        <Loader2 className="size-4 shrink-0 animate-spin" />
        Szukam dostępnych połączeń Flixbus…
      </div>
    )
  }

  if (error) {
    return (
      <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
    )
  }

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
        Brak połączeń w podanym czasie oczekiwania. Spróbuj wydłużyć czas lub zmienić godzinę
        gotowości.
      </p>
    )
  }

  return (
    <div className="space-y-3 border-t border-border pt-5">
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Bus className="size-3.5" aria-hidden />
          Dostępne połączenia ({items.length})
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Posortowane od najszybszego odjazdu — wybierz kurs, aby dodać przystanek.
        </p>
      </div>
      <ul className="space-y-2">
        {items.map((item) => {
          const { connection } = item
          return (
            <li key={connection.id}>
              <button
                type="button"
                onClick={() => onSelect(item)}
                onMouseEnter={() => onHover(item)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(item)}
                onBlur={() => onHover(null)}
                className={cn(
                  "w-full rounded-lg border px-3 py-3 text-left text-sm transition-colors hover:bg-muted/50",
                  "border-border bg-background",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{item.destinationStopName}</p>
                    <p className="text-xs text-muted-foreground">{item.destinationCityLabel}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant="secondary" className="text-[10px] font-semibold">
                      {formatDepartureIn(connection.duration_waiting)}
                    </Badge>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {formatDurationSeconds(connection.duration_in_travel)} w trasie
                    </p>
                  </div>
                </div>
                <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                  <p>
                    <span className="font-medium text-foreground">Wyjazd:</span>{" "}
                    {formatSchedule(connection.departure_date, connection.departure_time)}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Przyjazd:</span>{" "}
                    {formatSchedule(connection.arrival_date, connection.arrival_time)}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Oczekiwanie:</span>{" "}
                    {formatDurationSeconds(connection.duration_waiting)}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Razem:</span>{" "}
                    {formatDurationSeconds(connection.duration_total)}
                  </p>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
