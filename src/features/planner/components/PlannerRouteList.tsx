import { Bus, MapPin } from "lucide-react"

import type { PlannerRouteLeg } from "@/features/planner/types"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

type PlannerRouteListProps = {
  legs: PlannerRouteLeg[]
  onRemove: (legId: string) => void
}

export function PlannerRouteList({ legs, onRemove }: PlannerRouteListProps) {
  if (legs.length === 0) return null

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Twoja trasa ({legs.length})
      </p>
      <ol className="space-y-2">
        {legs.map((leg, index) => (
          <li
            key={leg.id}
            className="flex gap-3 rounded-lg border border-border bg-muted/20 p-3 text-sm"
          >
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                index === 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              {index === 0 ? <Bus className="size-4" aria-hidden /> : index + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{leg.stopName}</p>
                <Badge variant="secondary" className="text-[10px]">
                  {leg.cityLabel}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{leg.address}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatLegSchedule(leg.date, leg.time)}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="shrink-0 text-muted-foreground"
              onClick={() => onRemove(leg.id)}
              aria-label={`Usuń przystanek ${leg.stopName}`}
            >
              Usuń
            </Button>
          </li>
        ))}
      </ol>
    </div>
  )
}

function formatLegSchedule(date: string, time: string): string {
  const parsed = new Date(`${date}T${time}`)
  if (Number.isNaN(parsed.getTime())) {
    return `${date}, ${time}`
  }

  return parsed.toLocaleString("pl-PL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function PlannerCurrentStopPreview({
  stopName,
  address,
  date,
  time,
}: {
  stopName: string
  address: string
  date: string
  time: string
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3 text-sm">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MapPin className="size-4" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Wybrany przystanek
        </p>
        <p className="font-medium">{stopName}</p>
        <p className="text-xs text-muted-foreground">{address}</p>
        {date && time && (
          <p className="mt-1 text-xs text-muted-foreground">
            {formatLegSchedule(date, time)}
          </p>
        )}
      </div>
    </div>
  )
}
