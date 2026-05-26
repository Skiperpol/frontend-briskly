import { Compass, MapPin, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import type { UserTrip } from "@/domain/models"

import { TripService } from "@/domain/services"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent } from "@/shared/components/ui/card"
import { PageLayout } from "@/shared/components/layout/PageLayout"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { cn } from "@/shared/lib/utils"

function formatLegCount(count: number): string {
  if (count === 0) return "Brak przystanków"
  if (count === 1) return "1 przystanek"
  if (count < 5) return `${count} przystanki`
  return `${count} przystanków`
}

export function PlannerHomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const service = TripService.getInstance()
  const [draftTrips, setDraftTrips] = useState<UserTrip[]>(() => service.getPlanningTrips())

  useEffect(() => {
    setDraftTrips(service.getPlanningTrips())
  }, [location.key, service])

  const handleCreateTrip = () => {
    const trip = service.createPlanningTrip()
    navigate(`/planner/${trip.id}`)
  }

  return (
    <PageLayout
      title="Planowanie"
      subtitle="Wybierz podróż do dokończenia lub zaplanuj nową trasę Flixbus"
    >
      <ScrollArea className="flex-1">
        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3">
          <button
            type="button"
            onClick={handleCreateTrip}
            className={cn(
              "flex min-h-[168px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-6 text-center transition-colors",
              "hover:border-primary hover:bg-primary/10",
            )}
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Plus className="size-6" aria-hidden />
            </div>
            <div>
              <p className="font-semibold">Stwórz nową podróż</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Pusta trasa — dodasz przystanki krok po kroku
              </p>
            </div>
          </button>

          {draftTrips.map((trip) => {
            const legCount = service.getPlannerLegs(trip.id).length
            return (
              <Link
                key={trip.id}
                to={`/planner/${trip.id}`}
                className="group block min-h-[168px] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="h-full overflow-hidden py-0 transition-shadow group-hover:shadow-md">
                  <div
                    className="h-20 bg-cover bg-center"
                    style={{ backgroundImage: `url(${trip.heroImageUrl})` }}
                  />
                  <CardContent className="space-y-2 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 font-semibold leading-tight">{trip.name}</p>
                      <Compass className="size-4 shrink-0 text-primary" aria-hidden />
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {trip.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Badge variant="secondary" className="gap-1 text-[10px]">
                        <MapPin className="size-3" aria-hidden />
                        {formatLegCount(legCount)}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        W planowaniu
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </ScrollArea>
    </PageLayout>
  )
}
