import { Compass, MapPin, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { fetchPopularPlannerCities } from "@/features/planner/plannerLogistics"
import { getPlannerLegs } from "@/domain/trips/tripLoader"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog"
import { PageLayout } from "@/shared/components/layout/PageLayout"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { queryKeys } from "@/shared/api/queryKeys"
import {
  useCreateTripMutation,
  useDeleteTripMutation,
} from "@/shared/hooks/queries/useTripMutations"
import { useTripsQuery } from "@/shared/hooks/queries/useTripsQuery"
import { queryClient } from "@/shared/lib/queryClient"
import { cn } from "@/shared/lib/utils"

function formatLegCount(count: number): string {
  if (count === 0) return "Brak przystanków"
  if (count === 1) return "1 przystanek"
  if (count < 5) return `${count} przystanki`
  return `${count} przystanków`
}

type TripToDelete = {
  id: string
  name: string
}

export function PlannerHomePage() {
  const navigate = useNavigate()
  const tripsQuery = useTripsQuery()
  const createTripMutation = useCreateTripMutation()
  const deleteTripMutation = useDeleteTripMutation()
  const [tripToDelete, setTripToDelete] = useState<TripToDelete | null>(null)

  const error =
    tripsQuery.error instanceof Error
      ? tripsQuery.error.message
      : createTripMutation.error instanceof Error
        ? createTripMutation.error.message
        : deleteTripMutation.error instanceof Error
          ? deleteTripMutation.error.message
          : null

  useEffect(() => {
    void queryClient.prefetchQuery({
      queryKey: queryKeys.cities.popular(),
      queryFn: () => fetchPopularPlannerCities(),
      staleTime: 5 * 60_000,
    })
  }, [])

  const handleCreateTrip = () => {
    createTripMutation.mutate(undefined, {
      onSuccess: (bundle) => navigate(`/planner/${bundle.trip.id}`),
    })
  }

  const handleConfirmDelete = () => {
    if (!tripToDelete) return

    deleteTripMutation.mutate(tripToDelete.id, {
      onSuccess: () => setTripToDelete(null),
    })
  }

  const planningTrips =
    tripsQuery.data?.filter((bundle) => !bundle.trip.isFinalized) ?? []

  return (
    <PageLayout
      title="Planowanie"
      subtitle="Wybierz podróż do dokończenia lub zaplanuj nową trasę Flixbus"
    >
      <ScrollArea className="flex-1">
        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3">
          {error && (
            <p className="col-span-full rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleCreateTrip}
            disabled={createTripMutation.isPending}
            className={cn(
              "flex min-h-[168px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-6 text-center transition-colors",
              "hover:border-primary hover:bg-primary/10 disabled:opacity-60",
            )}
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Plus className="size-6" aria-hidden />
            </div>
            <div>
              <p className="font-semibold">
                {createTripMutation.isPending ? "Tworzenie…" : "Stwórz nową podróż"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Pusta trasa — dodasz przystanki krok po kroku
              </p>
            </div>
          </button>

          {tripsQuery.isLoading && (
            <p className="col-span-full text-sm text-muted-foreground">Ładowanie podróży…</p>
          )}

          {!tripsQuery.isLoading &&
            planningTrips.map((bundle) => {
              const legCount = getPlannerLegs(bundle.trip.id, bundle.connections).length
              const trip = bundle.trip
              return (
                <Card
                  key={trip.id}
                  className="group relative h-full min-h-[168px] overflow-hidden py-0 transition-shadow hover:shadow-md"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 z-10 size-8 bg-background/80 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                    disabled={deleteTripMutation.isPending}
                    aria-label={`Usuń podróż ${trip.name}`}
                    onClick={() => setTripToDelete({ id: trip.id, name: trip.name })}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>

                  <Link
                    to={`/planner/${trip.id}`}
                    className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div
                      className="h-20 bg-cover bg-center"
                      style={{ backgroundImage: `url(${trip.heroImageUrl})` }}
                    />
                    <CardContent className="space-y-2 py-4">
                      <div className="flex items-start justify-between gap-2 pr-8">
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
                  </Link>
                </Card>
              )
            })}
        </div>
      </ScrollArea>

      <ConfirmDialog
        open={tripToDelete !== null}
        title="Usunąć planowaną podróż?"
        description={
          tripToDelete
            ? `Czy na pewno chcesz usunąć „${tripToDelete.name}"? Tej operacji nie można cofnąć.`
            : ""
        }
        confirmLabel={deleteTripMutation.isPending ? "Usuwanie…" : "Usuń podróż"}
        cancelLabel="Anuluj"
        onConfirm={handleConfirmDelete}
        onCancel={() => setTripToDelete(null)}
      />
    </PageLayout>
  )
}
