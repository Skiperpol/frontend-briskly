import {
  BookOpen,
  BedDouble,
  Plane,
  Plus,
  UtensilsCrossed,
} from "lucide-react"

import type { ScheduleStop, ScheduleStopKind } from "@/domain/models"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { TopBar } from "@/shared/components/layout/TopBar"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { useTripData } from "@/shared/hooks/useTripData"
import { cn } from "@/shared/lib/utils"

const stopIcons: Record<ScheduleStopKind, typeof Plane> = {
  flight: Plane,
  hotel: BedDouble,
  journal: BookOpen,
  dining: UtensilsCrossed,
  train: Plane,
  bus: Plane,
}

const stopColors: Record<ScheduleStopKind, string> = {
  flight: "bg-blue-100 text-blue-600",
  hotel: "bg-amber-100 text-amber-700",
  journal: "bg-orange-100 text-orange-600",
  dining: "bg-indigo-100 text-indigo-600",
  train: "bg-slate-100 text-slate-600",
  bus: "bg-slate-100 text-slate-600",
}

export function SchedulePage() {
  const { activeTrip } = useTripData()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar title={activeTrip.name} />

      <div className="flex min-h-0 flex-1">
        <ScrollArea className="w-full max-w-xl border-r border-border">
          <div className="p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {activeTrip.dayLabel}
            </p>
            <div className="relative">
              <div className="absolute top-2 bottom-2 left-4 w-px bg-border" />
              {activeTrip.scheduleStops.map((stop) => (
                <ScheduleStopCard key={stop.id} stop={stop} />
              ))}
            </div>
          </div>
        </ScrollArea>

        <MapPanel />
      </div>
    </div>
  )
}

function ScheduleStopCard({ stop }: { stop: ScheduleStop }) {
  const Icon = stopIcons[stop.kind]

  return (
    <div className="relative flex gap-4 pb-6 pl-10">
      <div
        className={cn(
          "absolute left-1.5 z-10 flex size-7 items-center justify-center rounded-full border-2 border-background",
          stopColors[stop.kind],
        )}
      >
        <Icon className="size-3.5" />
      </div>
      <Card className="flex-1 py-3">
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

function MapPanel() {
  return (
    <div className="relative hidden min-w-0 flex-1 lg:block">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#e8eef5_0%,#d4dce8_50%,#c5d0e0_100%)]" />
      <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        Mapa — wizualizacja trasy
      </p>
      <div className="absolute right-6 bottom-24 left-6 flex gap-3">
        <Card className="bg-foreground py-3 text-background">
          <CardContent className="px-4 py-0">
            <p className="text-[10px] opacity-70">Łączny dystans</p>
            <p className="font-bold">1240 km w tej wycieczce</p>
          </CardContent>
        </Card>
        <Card className="flex-1 py-3">
          <CardContent className="px-4 py-0 text-sm">
            <p className="text-[10px] text-muted-foreground">Następny przystanek</p>
            <p className="font-semibold">Centrum Paryża</p>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="px-4 py-0 text-sm">
            <p className="font-semibold">22°C</p>
            <p className="text-xs text-muted-foreground">Rozproszone chmury</p>
          </CardContent>
        </Card>
      </div>
      <Button size="icon-lg" className="absolute right-6 bottom-6 rounded-full">
        <Plus />
      </Button>
    </div>
  )
}
