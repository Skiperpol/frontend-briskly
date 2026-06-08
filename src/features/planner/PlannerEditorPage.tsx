import { ArrowLeft, Check, Plus } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"

import { TripService } from "@/domain/services"
import { PlannerMap } from "@/features/planner/components/PlannerMap"
import {
  PlannerCurrentStopPreview,
  PlannerRouteList,
} from "@/features/planner/components/PlannerRouteList"
import { PlannerRecommendedList } from "@/features/planner/components/PlannerRecommendedList"
import {
  fetchPlannerCities,
  fetchRecommendedStops,
  fetchStopsForCity,
  legToDepartureStop,
} from "@/features/planner/plannerLogistics"
import type {
  PlannerCity,
  PlannerDepartureStop,
  PlannerRouteLeg,
} from "@/features/planner/types"
import { tripSchedulePath } from "@/features/routes/tripPaths"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { PageLayout } from "@/shared/components/layout/PageLayout"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { useTrip } from "@/shared/hooks/useTrip"
import { cn } from "@/shared/lib/utils"

const selectClassName = cn(
  "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
)

const MIN_STOPS_TO_FINALIZE = 2

function createLegId(): string {
  return `leg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function PlannerEditorPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const service = TripService.getInstance()
  const { trip, loading: tripLoading } = useTrip(tripId)

  const [routeLegs, setRouteLegs] = useState<PlannerRouteLeg[]>([])
  const [cityQuery, setCityQuery] = useState("")
  const [cityResults, setCityResults] = useState<PlannerCity[]>([])
  const [selectedCity, setSelectedCity] = useState<PlannerCity | null>(null)
  const [pickerStops, setPickerStops] = useState<PlannerDepartureStop[]>([])
  const [departureDate, setDepartureDate] = useState("")
  const [departureTime, setDepartureTime] = useState("")
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null)
  const [hoveredStopId, setHoveredStopId] = useState<string | null>(null)
  const [zoomStopId, setZoomStopId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [recommendedItems, setRecommendedItems] = useState<
    Awaited<ReturnType<typeof fetchRecommendedStops>>
  >([])

  useEffect(() => {
    if (!tripId || !trip || trip.isFinalized) return
    setRouteLegs(service.getPlannerLegs(tripId))
  }, [service, trip, tripId])

  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(() => {
      void fetchPlannerCities(cityQuery).then((cities) => {
        if (!cancelled) setCityResults(cities)
      })
    }, cityQuery.trim().length < 2 ? 0 : 300)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [cityQuery])

  useEffect(() => {
    if (!selectedCity) {
      setPickerStops([])
      return
    }

    let cancelled = false
    void fetchStopsForCity(selectedCity.id, selectedCity.label).then((stops) => {
      if (!cancelled) setPickerStops(stops)
    })

    return () => {
      cancelled = true
    }
  }, [selectedCity?.id, selectedCity?.label])

  const lastLeg = routeLegs.length > 0 ? routeLegs[routeLegs.length - 1] : null

  useEffect(() => {
    if (!lastLeg) {
      setRecommendedItems([])
      return
    }

    let cancelled = false
    void fetchRecommendedStops(
      lastLeg,
      routeLegs.map((leg) => leg.stopId),
    ).then((items) => {
      if (!cancelled) setRecommendedItems(items)
    })

    return () => {
      cancelled = true
    }
  }, [lastLeg, routeLegs])

  const persistLegs = useCallback(
    async (legs: PlannerRouteLeg[]) => {
      if (!tripId) return
      setSaving(true)
      setSaveError(null)
      try {
        await service.savePlannerLegs(tripId, legs)
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Nie udało się zapisać trasy.")
      } finally {
        setSaving(false)
      }
    },
    [service, tripId],
  )

  const stopById = useMemo(() => {
    const map = new Map<string, PlannerDepartureStop>()
    for (const stop of pickerStops) map.set(stop.id, stop)
    for (const item of recommendedItems) map.set(item.stop.id, item.stop)
    for (const leg of routeLegs) map.set(leg.stopId, legToDepartureStop(leg))
    return map
  }, [pickerStops, recommendedItems, routeLegs])

  const canPickStop = Boolean(selectedCity && departureDate && departureTime)
  const canAddLeg = canPickStop && selectedStopId !== null
  const canFinalize = routeLegs.length >= MIN_STOPS_TO_FINALIZE && !saving

  const recommendedStops = useMemo(
    () => recommendedItems.map((item) => item.stop),
    [recommendedItems],
  )

  useEffect(() => {
    if (selectedStopId && !stopById.has(selectedStopId)) {
      setSelectedStopId(null)
    }
  }, [selectedStopId, stopById])

  const selectedStop = selectedStopId ? stopById.get(selectedStopId) : undefined

  const applyRecommendedStop = useCallback(
    (stop: PlannerDepartureStop) => {
      const item = recommendedItems.find((entry) => entry.stop.id === stop.id)
      const cityLabel = item?.cityLabel ?? stop.address
      setSelectedCity({
        id: stop.cityId,
        label: cityLabel,
        mapCenter: stop.position,
        mapZoom: 11,
      })
      setCityQuery(cityLabel)
      setSelectedStopId(stop.id)
      setZoomStopId(null)
    },
    [recommendedItems],
  )

  const handleStopSelectFromMap = useCallback(
    (stopId: string) => {
      const stop = stopById.get(stopId)
      if (!stop) return
      if (canPickStop && pickerStops.some((item) => item.id === stopId)) {
        setSelectedStopId(stopId)
        return
      }
      if (recommendedStops.some((item) => item.id === stopId)) {
        applyRecommendedStop(stop)
      }
    },
    [applyRecommendedStop, canPickStop, pickerStops, recommendedStops, stopById],
  )

  const handleAddLeg = () => {
    if (!canAddLeg || !selectedStop || !selectedCity) return

    const leg: PlannerRouteLeg = {
      id: createLegId(),
      cityId: selectedCity.id,
      cityLabel: selectedCity.label,
      stopId: selectedStop.id,
      stopName: selectedStop.name,
      address: selectedStop.address,
      position: selectedStop.position,
      date: departureDate,
      time: departureTime,
    }

    const nextLegs = [...routeLegs, leg]
    setRouteLegs(nextLegs)
    setCityQuery("")
    setSelectedCity(null)
    setSelectedStopId(null)
    setHoveredStopId(null)
    setZoomStopId(null)
    void persistLegs(nextLegs)
  }

  const handleRemoveLeg = (legId: string) => {
    const nextLegs = routeLegs.filter((leg) => leg.id !== legId)
    setRouteLegs(nextLegs)
    void persistLegs(nextLegs)
  }

  const handleFinalize = async () => {
    if (!tripId) return
    setSaving(true)
    setSaveError(null)
    try {
      const ok = await service.finalizeTrip(tripId)
      setConfirmOpen(false)
      if (ok) {
        navigate(tripSchedulePath(tripId))
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Nie udało się zatwierdzić trasy.")
    } finally {
      setSaving(false)
    }
  }

  if (tripLoading) {
    return (
      <PageLayout title="Planowanie" subtitle="Ładowanie podróży…">
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Ładowanie…
        </div>
      </PageLayout>
    )
  }

  if (!tripId || !trip) {
    return <Navigate to="/planner" replace />
  }

  if (trip.isFinalized) {
    return <Navigate to={tripSchedulePath(tripId)} replace />
  }

  const stepLabel =
    routeLegs.length === 0 ? "Pierwszy przystanek" : `Przystanek ${routeLegs.length + 1}`

  return (
    <PageLayout
      title={trip.name}
      subtitle="Buduj trasę krok po kroku — dodawaj przystanki Flixbus"
      action={
        <Button size="sm" variant="outline" className="gap-2" asChild>
          <Link to="/planner">
            <ArrowLeft className="size-4" aria-hidden />
            Planowanie
          </Link>
        </Button>
      }
      trailing={
        <Button
          size="sm"
          className="gap-2"
          disabled={!canFinalize}
          title={
            canFinalize
              ? undefined
              : `Dodaj co najmniej ${MIN_STOPS_TO_FINALIZE} przystanki, aby zatwierdzić trasę`
          }
          onClick={() => setConfirmOpen(true)}
        >
          <Check className="size-4" aria-hidden />
          Zatwierdź trasę
        </Button>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <ScrollArea className="w-full shrink-0 lg:max-w-md lg:border-r lg:border-border xl:max-w-lg">
          <div className="space-y-6 p-6">
            {saveError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {saveError}
              </p>
            )}

            {routeLegs.length > 0 && (
              <Card>
                <CardContent className="space-y-3 pt-6">
                  <PlannerRouteList legs={routeLegs} onRemove={handleRemoveLeg} />
                  {routeLegs.length < MIN_STOPS_TO_FINALIZE && (
                    <p className="text-xs text-muted-foreground">
                      Do zatwierdzenia trasy potrzebujesz jeszcze{" "}
                      {MIN_STOPS_TO_FINALIZE - routeLegs.length}{" "}
                      {MIN_STOPS_TO_FINALIZE - routeLegs.length === 1
                        ? "przystanek"
                        : "przystanki"}
                      .
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{stepLabel}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Miasto, data, godzina i przystanek — potem dodaj do trasy.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="planner-city" className="text-[10px] uppercase tracking-wider">
                    Miasto
                  </Label>
                  <Input
                    id="planner-city"
                    value={cityQuery}
                    placeholder="Wyszukaj lub wybierz z listy popularnych miast"
                    onChange={(event) => {
                      setCityQuery(event.target.value)
                      setSelectedCity(null)
                    }}
                  />
                  {cityResults.length > 0 && !selectedCity && (
                    <ul className="max-h-40 overflow-y-auto rounded-md border border-border">
                      {cityResults.map((city) => (
                        <li key={city.id}>
                          <button
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                            onClick={() => {
                              setSelectedCity(city)
                              setCityQuery(city.label)
                              setCityResults([])
                            }}
                          >
                            {city.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {selectedCity && (
                    <p className="text-xs text-muted-foreground">
                      Wybrane: {selectedCity.label}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="planner-date" className="text-[10px] uppercase tracking-wider">
                      Data
                    </Label>
                    <Input
                      id="planner-date"
                      type="date"
                      value={departureDate}
                      onChange={(event) => setDepartureDate(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="planner-time" className="text-[10px] uppercase tracking-wider">
                      Godzina
                    </Label>
                    <Input
                      id="planner-time"
                      type="time"
                      value={departureTime}
                      onChange={(event) => setDepartureTime(event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planner-stop" className="text-[10px] uppercase tracking-wider">
                    Przystanek
                  </Label>
                  <select
                    id="planner-stop"
                    className={selectClassName}
                    value={selectedStopId ?? ""}
                    disabled={!canPickStop || pickerStops.length === 0}
                    onChange={(event) => {
                      const value = event.target.value
                      const stopId = value.length > 0 ? value : null
                      setSelectedStopId(stopId)
                      setZoomStopId(stopId)
                    }}
                  >
                    <option value="">
                      {canPickStop
                        ? pickerStops.length > 0
                          ? "Wybierz przystanek…"
                          : "Ładowanie przystanków…"
                        : "Najpierw miasto, datę i godzinę"}
                    </option>
                    {pickerStops.map((stop) => (
                      <option key={stop.id} value={stop.id}>
                        {stop.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedStop && (
                  <PlannerCurrentStopPreview
                    stopName={selectedStop.name}
                    address={selectedStop.address}
                    date={departureDate}
                    time={departureTime}
                  />
                )}

                <Button
                  type="button"
                  className="w-full gap-2"
                  disabled={!canAddLeg || saving}
                  onClick={handleAddLeg}
                >
                  <Plus className="size-4" aria-hidden />
                  {saving ? "Zapisywanie…" : "Dodaj przystanek"}
                </Button>

                {routeLegs.length > 0 && (
                  <PlannerRecommendedList
                    items={recommendedItems}
                    selectedStopId={selectedStopId}
                    onSelect={applyRecommendedStop}
                    onHover={setHoveredStopId}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <div className="relative min-h-[min(50vh,420px)] min-w-0 flex-1 lg:min-h-0">
          <PlannerMap
            cityCenter={selectedCity?.mapCenter}
            cityZoom={selectedCity?.mapZoom}
            departureDate={departureDate}
            departureTime={departureTime}
            routeLegs={routeLegs}
            pickerStops={pickerStops}
            recommendedStops={recommendedStops}
            stopById={stopById}
            selectedStopId={selectedStopId}
            hoveredStopId={hoveredStopId}
            zoomStopId={zoomStopId}
            onStopSelect={handleStopSelectFromMap}
            onStopHover={setHoveredStopId}
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Zakończyć planowanie podróży?"
        description="Czy na pewno chcesz zatwierdzić trasę? Po zatwierdzeniu nie będzie można jej edytować w planowaniu."
        confirmLabel="Zatwierdź trasę"
        cancelLabel="Kontynuuj planowanie"
        onConfirm={() => void handleFinalize()}
        onCancel={() => setConfirmOpen(false)}
      />
    </PageLayout>
  )
}
