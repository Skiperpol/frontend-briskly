import { Bus, MapPin, Plane, Train } from "lucide-react"
import { useState } from "react"

import type { Destination, RouteLeg, TransportMode } from "@/domain/models"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Slider } from "@/shared/components/ui/slider"
import { TopBar } from "@/shared/components/layout/TopBar"
import { useTripData } from "@/shared/hooks/useTripData"
import { cn } from "@/shared/lib/utils"

const modeIcons: Record<TransportMode, typeof Plane> = {
  flight: Plane,
  train: Train,
  bus: Bus,
}

export function PlannerPage() {
  const { activeTrip, destinations } = useTripData()
  const [view, setView] = useState<"grid" | "list">("grid")

  return (
    <>
      <TopBar />
      <div className="flex items-center gap-6 border-b border-border px-6 py-2 text-xs font-semibold uppercase tracking-wider">
        <span className="text-muted-foreground">Plany</span>
        <span className="border-b-2 border-primary pb-2 text-primary">Kreator</span>
        <span className="text-muted-foreground">Archiwum</span>
      </div>
      <ScrollArea className="flex-1">
        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <PlannerForm legs={activeTrip.legs} />
          <DestinationPanel destinations={destinations} view={view} onViewChange={setView} />
        </div>
      </ScrollArea>
    </>
  )
}

function PlannerForm({ legs }: { legs: RouteLeg[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Kreator logistyczny</CardTitle>
        <p className="text-xs text-muted-foreground">
          Optymalizacja tras z uwzględnieniem sugestii destynacji i dostępnych połączeń.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-wider">Miejsce startu</Label>
          <div className="relative">
            <MapPin className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" defaultValue="Warszawa, PL" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-wider">Data wyjazdu</Label>
            <Input defaultValue="15.06.2024" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-wider">Powrót</Label>
            <Input defaultValue="25.06.2024" />
          </div>
        </div>
        <Slider label="Tempo podróży" valueLabel="Zrównoważone" defaultValue={50} />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Powolne</span>
          <span>Intensywne</span>
        </div>
        <Slider label="Max. czas oczekiwania" valueLabel="4h 38m" defaultValue={65} />

        <div className="space-y-3 pt-2">
          <p className="text-xs font-semibold">Podgląd trasy: odcinki 1–3</p>
          {legs.map((leg, index) => (
            <RouteLegRow key={leg.id} leg={leg} index={index + 1} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function RouteLegRow({ leg, index }: { leg: RouteLeg; index: number }) {
  const Icon = modeIcons[leg.mode]
  return (
    <div className="flex gap-3 rounded-lg border border-border p-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-medium">
          {index}. {leg.from} → {leg.to}
        </p>
        <p className="text-xs text-muted-foreground">
          {leg.code} · {leg.duration} · {leg.meta}
        </p>
        {leg.waitTime && (
          <Badge variant="secondary" className="mt-1 text-[10px]">
            Oczekiwanie: {leg.waitTime}
          </Badge>
        )}
      </div>
    </div>
  )
}

function DestinationPanel({
  destinations,
  view,
  onViewChange,
}: {
  destinations: Destination[]
  view: "grid" | "list"
  onViewChange: (v: "grid" | "list") => void
}) {
  const featured = destinations.filter((d) => d.featured)
  const compact = destinations.filter((d) => !d.featured)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Polecane kierunki</h2>
          <p className="text-xs text-muted-foreground">
            Sugestie według atrakcyjności i realnych połączeń.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border p-0.5">
          <Button
            size="xs"
            variant={view === "grid" ? "default" : "ghost"}
            onClick={() => onViewChange("grid")}
          >
            Siatka
          </Button>
          <Button
            size="xs"
            variant={view === "list" ? "default" : "ghost"}
            onClick={() => onViewChange("list")}
          >
            Lista
          </Button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {featured.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} large />
          ))}
          {compact.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {destinations.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} list />
          ))}
        </div>
      )}
    </div>
  )
}

function DestinationCard({
  destination,
  large,
  list,
}: {
  destination: Destination
  large?: boolean
  list?: boolean
}) {
  if (list) {
    return (
      <Card className="flex flex-row overflow-hidden py-0">
        <div
          className="w-24 shrink-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${destination.imageUrl})` }}
        />
        <CardContent className="flex flex-1 flex-col justify-center py-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{destination.fullName}</span>
            <Badge>{destination.matchPercent}%</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{destination.description}</p>
          <p className="mt-1 text-xs text-muted-foreground">{destination.travelTime}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "overflow-hidden py-0",
        large && "sm:col-span-2",
      )}
    >
      <div
        className={cn("bg-cover bg-center", large ? "h-40" : "h-24")}
        style={{ backgroundImage: `url(${destination.imageUrl})` }}
      />
      <CardContent className="space-y-1 py-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold">{destination.fullName}</span>
          <Badge>{destination.matchPercent}% dopasowania</Badge>
        </div>
        {destination.badge && (
          <Badge variant="secondary">{destination.badge}</Badge>
        )}
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {destination.description}
        </p>
        <p className="text-xs text-muted-foreground">
          {destination.travelTime} · {destination.budgetLabel}
        </p>
      </CardContent>
    </Card>
  )
}
