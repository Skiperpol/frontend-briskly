import { ArrowDownToLine, ArrowUpFromLine, Bus, ChevronDown } from "lucide-react"
import { useState } from "react"

import type { ScheduleStop } from "@/domain/models"
import { formatScheduleDateRange, formatStayLabel } from "@/features/routes/scheduleStopFormatters"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent } from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"

const TIMELINE_ICON_CLASS = "bg-sky-100 text-sky-600"

type ScheduleStopCardProps = {
  stop: ScheduleStop
  selected: boolean
  onSelect: () => void
}

export function ScheduleStopCard({ stop, selected, onSelect }: ScheduleStopCardProps) {
  const [expanded, setExpanded] = useState(false)
  const hasMapPosition = Boolean(stop.position)
  const dateRange = formatScheduleDateRange(stop.timing)
  const stayLabel = formatStayLabel(stop.timing.stayDays)
  const descriptionParagraphs = stop.cityInfo.descriptionParagraphs ?? []
  const hasDescription = descriptionParagraphs.length > 0
  const showFooter = Boolean(dateRange || stayLabel || hasDescription)

  const handleCardClick = () => {
    if (hasMapPosition) onSelect()
    if (hasDescription) setExpanded((value) => !value)
  }

  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      <div
        className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-background ${TIMELINE_ICON_CLASS}`}
      >
        <Bus className="size-3.5" aria-hidden />
      </div>
      <Card
        className={cn(
          "flex-1 overflow-hidden py-0 transition-shadow",
          (hasMapPosition || hasDescription) && "cursor-pointer hover:shadow-md",
          selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          !hasMapPosition && "opacity-90",
        )}
        onClick={handleCardClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            handleCardClick()
          }
        }}
        role={hasMapPosition || hasDescription ? "button" : undefined}
        tabIndex={hasMapPosition || hasDescription ? 0 : undefined}
        aria-expanded={hasDescription ? expanded : undefined}
        aria-pressed={hasMapPosition ? selected : undefined}
        aria-label={
          hasMapPosition
            ? `${stop.title}, ${stop.subtitle} — pokaż na mapie`
            : hasDescription
              ? `${stop.title} — rozwiń opis`
              : undefined
        }
      >
        <CardContent className="space-y-3 px-4 py-3">
          {(stop.timing.arrivalTime || stop.timing.departureTime) && (
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {stop.timing.arrivalTime && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <ArrowDownToLine className="size-4 shrink-0 text-sky-600" aria-hidden />
                  <span className="sr-only">Przyjazd</span>
                  <span className="font-medium text-foreground">{stop.timing.arrivalTime}</span>
                </div>
              )}
              {stop.timing.departureTime && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <ArrowUpFromLine className="size-4 shrink-0 text-sky-600" aria-hidden />
                  <span className="sr-only">Odjazd</span>
                  <span className="font-medium text-foreground">{stop.timing.departureTime}</span>
                </div>
              )}
            </div>
          )}

          <div>
            <p className="font-semibold leading-tight">{stop.title}</p>
            <p className="text-sm text-muted-foreground">{stop.subtitle}</p>
          </div>

          {stop.imageUrl && (
            <img
              src={stop.imageUrl}
              alt=""
              className="h-28 w-full rounded-lg object-cover"
            />
          )}

          {stop.journalSnippet && (
            <p className="rounded-lg bg-muted/80 p-2 text-xs italic text-muted-foreground">
              &ldquo;{stop.journalSnippet}&rdquo;
            </p>
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

          {showFooter && (
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
              <div className="min-w-0 text-xs">
                {dateRange && <p className="font-medium text-foreground">{dateRange}</p>}
                {stayLabel && <p className="text-muted-foreground">{stayLabel}</p>}
              </div>
              {hasDescription && (
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform",
                    expanded && "rotate-180",
                  )}
                  aria-hidden
                />
              )}
            </div>
          )}

          {expanded && hasDescription && (
            <div className="space-y-2 border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground">
              {descriptionParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
