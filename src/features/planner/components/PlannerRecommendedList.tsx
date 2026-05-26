import { Sparkles } from "lucide-react"

import type { PlannerDepartureStop, RecommendedStop } from "@/features/planner/types"
import { cn } from "@/shared/lib/utils"

type PlannerRecommendedListProps = {
  items: RecommendedStop[]
  selectedStopId: string | null
  onSelect: (stop: PlannerDepartureStop) => void
  onHover: (stopId: string | null) => void
}

export function PlannerRecommendedList({
  items,
  selectedStopId,
  onSelect,
  onHover,
}: PlannerRecommendedListProps) {
  if (items.length === 0) return null

  return (
    <div className="space-y-3 border-t border-border pt-5">
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="size-3.5" aria-hidden />
          Polecane w okolicy
        </p>
      </div>
      <ul className="space-y-2">
        {items.map(({ stop, distanceKm, cityLabel }) => {
          const isSelected = selectedStopId === stop.id
          return (
            <li key={stop.id}>
              <button
                type="button"
                onClick={() => onSelect(stop)}
                onMouseEnter={() => onHover(stop.id)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(stop.id)}
                onBlur={() => onHover(null)}
                className={cn(
                  "w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/50",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border bg-background",
                )}
              >
                <p className="font-medium">{stop.name}</p>
                <p className="text-xs text-muted-foreground">
                  {cityLabel} · ~{Math.round(distanceKm)} km
                </p>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
