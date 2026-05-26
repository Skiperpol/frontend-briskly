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
import { getRecommendedStopsNear } from "@/features/planner/plannerRecommendations"
import {
  getDepartureStopById,
  getDepartureStopsForCity,
  getPlannerCity,
  PLANNER_CITIES,
} from "@/features/planner/plannerStops"
import type { PlannerDepartureStop, PlannerRouteLeg } from "@/features/planner/types"
import { tripSchedulePath } from "@/features/routes/tripPaths"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { PageLayout } from "@/shared/components/layout/PageLayout"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { cn } from "@/shared/lib/utils"

const selectClassName = cn(
  "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
)

function createLegId(): string {
  return `leg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function PlannerEditorPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const service = TripService.getInstance()
  const trip = tripId ? service.getTripById(tripId) : undefined

  const [routeLegs, setRouteLegs] = useState<PlannerRouteLeg[]>([])
  const [cityId, setCityId] = useState("")
  const [departureDate, setDepartureDate] = useState("")
  const [departureTime, setDepartureTime] = useState("")
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null)
  const [hoveredStopId, setHoveredStopId] = useState<string | null>(null)
  const [zoomStopId, setZoomStopId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    if (!tripId || !trip || trip.isFinalized) return
    setRouteLegs(service.getPlannerLegs(tripId))
  }, [service, trip, tripId])

  useEffect(() => {
    if (!tripId || !trip || trip.isFinalized) return
    service.savePlannerLegs(tripId, routeLegs)
  }, [routeLegs, service, trip, tripId])

  const canPickStop = Boolean(cityId && departureDate && departureTime)
  const canAddLeg = canPickStop && selectedStopId !== null
  const canFinalize = routeLegs.length > 0

  const pickerStops = useMemo(
    () => (canPickStop ? getDepartureStopsForCity(cityId) : []),
    [canPickStop, cityId],
  )

  const lastLeg = routeLegs.length > 0 ? routeLegs[routeLegs.length - 1] : null

  const recommendedItems = useMemo(() => {
    if (!lastLeg) return []
    const usedStopIds = routeLegs.map((leg) => leg.stopId)
    return getRecommendedStopsNear(lastLeg.position, usedStopIds)
  }, [lastLeg, routeLegs])

  const recommendedStops = useMemo(
    () => recommendedItems.map((item) => item.stop),
    [recommendedItems],
  )

  useEffect(() => {
    if (selectedStopId && !pickerStops.some((stop) => stop.id === selectedStopId)) {
      const isRecommended = recommendedStops.some((stop) => stop.id === selectedStopId)
      if (!isRecommended) {
        setSelectedStopId(null)
      }
    }
  }, [pickerStops, recommendedStops, selectedStopId])

  const selectedStop = selectedStopId ? getDepartureStopById(selectedStopId) : undefined

  const applyRecommendedStop = useCallback((stop: PlannerDepartureStop) => {
    setCityId(stop.cityId)
    setSelectedStopId(stop.id)
    setZoomStopId(null)
  }, [])

  const handleStopSelectFromMap = useCallback(
    (stopId: string) => {
      const stop = getDepartureStopById(stopId)
      if (!stop) return
      if (canPickStop && pickerStops.some((s) => s.id === stopId)) {
        setSelectedStopId(stopId)
        return
      }
      if (recommendedStops.some((s) => s.id === stopId)) {
        applyRecommendedStop(stop)
      }
    },
    [applyRecommendedStop, canPickStop, pickerStops, recommendedStops],
  )

  const handleAddLeg = () => {
    if (!canAddLeg || !selectedStop) return

    const city = getPlannerCity(cityId)
    const leg: PlannerRouteLeg = {
      id: createLegId(),
      cityId,
      cityLabel: city?.label ?? cityId,
      stopId: selectedStop.id,
      stopName: selectedStop.name,
      address: selectedStop.address,
      position: selectedStop.position,
      date: departureDate,
      time: departureTime,
    }

    setRouteLegs((prev) => [...prev, leg])
    setCityId("")
    setSelectedStopId(null)
    setHoveredStopId(null)
    setZoomStopId(null)
  }

  const handleRemoveLeg = (legId: string) => {
    setRouteLegs((prev) => prev.filter((leg) => leg.id !== legId))
  }

  const handleFinalize = () => {
    if (!tripId) return
    const ok = service.finalizeTrip(tripId)
    setConfirmOpen(false)
    if (ok) {
      navigate(tripSchedulePath(tripId))
    }
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
            {routeLegs.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <PlannerRouteList legs={routeLegs} onRemove={handleRemoveLeg} />
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
                  <select
                    id="planner-city"
                    className={selectClassName}
                    value={cityId}
                    onChange={(event) => setCityId(event.target.value)}
                  >
                    <option value="">Wybierz miasto…</option>
                    {PLANNER_CITIES.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.label}
                      </option>
                    ))}
                  </select>
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
                    disabled={!canPickStop}
                    onChange={(event) => {
                      const value = event.target.value
                      const stopId = value.length > 0 ? value : null
                      setSelectedStopId(stopId)
                      setZoomStopId(stopId)
                    }}
                  >
                    <option value="">
                      {canPickStop ? "Wybierz przystanek…" : "Najpierw miasto, datę i godzinę"}
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
                  disabled={!canAddLeg}
                  onClick={handleAddLeg}
                >
                  <Plus className="size-4" aria-hidden />
                  Dodaj przystanek
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
            cityId={cityId}
            departureDate={departureDate}
            departureTime={departureTime}
            routeLegs={routeLegs}
            pickerStops={pickerStops}
            recommendedStops={recommendedStops}
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
        onConfirm={handleFinalize}
        onCancel={() => setConfirmOpen(false)}
      />
    </PageLayout>
  )
}
