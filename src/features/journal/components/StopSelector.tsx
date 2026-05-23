import type { ScheduleStop } from "@/domain/models"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"

type StopSelectorProps = {
  stops: ScheduleStop[]
  selectedStopId: string
  noteCountByStop: Record<string, number>
  onSelect: (stopId: string) => void
}

export function StopSelector({
  stops,
  selectedStopId,
  noteCountByStop,
  onSelect,
}: StopSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Przystanki podróży
      </p>
      <ul className="space-y-1.5">
        {stops.map((stop) => {
          const count = noteCountByStop[stop.id] ?? 0
          const isSelected = stop.id === selectedStopId

          return (
            <li key={stop.id}>
              <button
                type="button"
                onClick={() => onSelect(stop.id)}
                className={cn(
                  "w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:bg-muted/50",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground">{stop.time}</p>
                    <p className="truncate text-sm font-medium">{stop.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{stop.subtitle}</p>
                  </div>
                  <Badge variant={isSelected ? "default" : "secondary"} className="shrink-0 text-[10px]">
                    {count === 1 ? "1 notatka" : count < 5 ? `${count} notatki` : `${count} notatek`}
                  </Badge>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
