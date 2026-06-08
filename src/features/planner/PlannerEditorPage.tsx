import { ArrowLeft, Check, Plus, Trash2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"

import { getPlannerLegs } from "@/domain/trips/tripLoader"
import { PlannerMap } from "@/features/planner/components/PlannerMap"
import {
  PlannerCurrentStopPreview,
  PlannerRouteList,
} from "@/features/planner/components/PlannerRouteList"
import { PlannerConnectionsList } from "@/features/planner/components/PlannerConnectionsList"
import {
  connectionOptionToLeg,
  DEFAULT_WAITING_MINUTES,
  filterAndSortConnections,
  WAITING_TIME_PRESETS,
} from "@/features/planner/plannerConnectionUtils"
import {
  fetchConnectionsFromStop,
  fetchPlannerCities,
  fetchStopsForCity,
  legToDepartureStop,
} from "@/features/planner/plannerLogistics"
import type {
  PlannerCity,
  PlannerConnectionOption,
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
import { usePopularCitiesQuery } from "@/shared/hooks/queries/usePopularCitiesQuery"
import {
  useDeleteTripMutation,
  useFinalizeTripMutation,
  useSavePlannerLegsMutation,
} from "@/shared/hooks/queries/useTripMutations"
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
  const { trip, connections, loading: tripLoading } = useTrip(tripId)
  const popularCitiesQuery = usePopularCitiesQuery()
  const saveLegsMutation = useSavePlannerLegsMutation(tripId ?? "")
  const finalizeMutation = useFinalizeTripMutation(tripId ?? "")
  const deleteTripMutation = useDeleteTripMutation()
  const legsInitializedFor = useRef<string | null>(null)

  const [routeLegs, setRouteLegs] = useState<PlannerRouteLeg[]>([])
  const [cityQuery, setCityQuery] = useState("")
  const [searchedCityResults, setSearchedCityResults] = useState<PlannerCity[]>([])
  const [selectedCity, setSelectedCity] = useState<PlannerCity | null>(null)
  const [pickerStops, setPickerStops] = useState<PlannerDepartureStop[]>([])
  const [departureDate, setDepartureDate] = useState("")
  const [departureTime, setDepartureTime] = useState("")
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null)
  const [hoveredStopId, setHoveredStopId] = useState<string | null>(null)
  const [zoomStopId, setZoomStopId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const saving = saveLegsMutation.isPending || finalizeMutation.isPending
  const [readyDate, setReadyDate] = useState("")
  const [readyTime, setReadyTime] = useState("")
  const [waitingMinutes, setWaitingMinutes] = useState(DEFAULT_WAITING_MINUTES)
  const [connectionOptions, setConnectionOptions] = useState<PlannerConnectionOption[]>([])
  const [connectionsLoading, setConnectionsLoading] = useState(false)
  const [connectionsError, setConnectionsError] = useState<string | null>(null)
  const [destinationCityQuery, setDestinationCityQuery] = useState("")
  const [searchedDestinationCityResults, setSearchedDestinationCityResults] = useState<
    PlannerCity[]
  >([])
  const [readyAnchorLegId, setReadyAnchorLegId] = useState<string | null>(null)
  const [selectedDestinationCity, setSelectedDestinationCity] = useState<PlannerCity | null>(null)

  useEffect(() => {
    legsInitializedFor.current = null
  }, [tripId])

  useEffect(() => {
    if (!tripId || !trip || trip.isFinalized || tripLoading) return
    if (legsInitializedFor.current === tripId) return
    setRouteLegs(getPlannerLegs(tripId, connections))
    legsInitializedFor.current = tripId
  }, [connections, trip, tripId, tripLoading])

  const cityResults = useMemo(() => {
    if (cityQuery.trim().length < 2) return popularCitiesQuery.data ?? []
    return searchedCityResults
  }, [cityQuery, popularCitiesQuery.data, searchedCityResults])

  const destinationCityResults = useMemo(() => {
    if (destinationCityQuery.trim().length < 2) return popularCitiesQuery.data ?? []
    return searchedDestinationCityResults
  }, [destinationCityQuery, popularCitiesQuery.data, searchedDestinationCityResults])

  useEffect(() => {
    const trimmed = cityQuery.trim()
    if (trimmed.length < 2) return

    let cancelled = false
    const timer = window.setTimeout(() => {
      void fetchPlannerCities(trimmed).then((cities) => {
        if (!cancelled) setSearchedCityResults(cities)
      })
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [cityQuery])

  useEffect(() => {
    const trimmed = destinationCityQuery.trim()
    if (trimmed.length < 2) return

    let cancelled = false
    const timer = window.setTimeout(() => {
      void fetchPlannerCities(trimmed).then((cities) => {
        if (!cancelled) setSearchedDestinationCityResults(cities)
      })
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [destinationCityQuery])

  useEffect(() => {
    if (!selectedCity) return

    let cancelled = false
    void fetchStopsForCity(selectedCity.id, selectedCity.label).then((stops) => {
      if (!cancelled) setPickerStops(stops)
    })

    return () => {
      cancelled = true
    }
  }, [selectedCity])

  const lastLeg = routeLegs.length > 0 ? routeLegs[routeLegs.length - 1] : null
  const isFirstLeg = routeLegs.length === 0

  if (lastLeg?.id !== readyAnchorLegId) {
    setReadyAnchorLegId(lastLeg?.id ?? null)
    setReadyDate(lastLeg?.date ?? "")
    setReadyTime(lastLeg?.time ?? "")
  }

  const canSearchConnections = Boolean(lastLeg && readyDate && readyTime)

  useEffect(() => {
    if (!canSearchConnections || !lastLeg) return

    let cancelled = false

    const timer = window.setTimeout(() => {
      if (cancelled) return
      setConnectionsLoading(true)
      setConnectionsError(null)

      void fetchConnectionsFromStop(
        lastLeg,
        readyDate,
        readyTime,
        waitingMinutes,
        routeLegs.map((leg) => leg.stopId),
      )
        .then((options) => {
          if (!cancelled) setConnectionOptions(options)
        })
        .catch((err) => {
          if (!cancelled) {
            setConnectionOptions([])
            setConnectionsError(
              err instanceof Error ? err.message : "Nie udało się pobrać połączeń.",
            )
          }
        })
        .finally(() => {
          if (!cancelled) setConnectionsLoading(false)
        })
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [canSearchConnections, lastLeg, readyDate, readyTime, waitingMinutes, routeLegs])

  const visibleConnectionOptions = useMemo(() => {
    if (!canSearchConnections) return []
    return filterAndSortConnections(connectionOptions, selectedDestinationCity?.id ?? null)
  }, [canSearchConnections, connectionOptions, selectedDestinationCity?.id])

  const persistLegs = useCallback(
    (legs: PlannerRouteLeg[]) => {
      if (!tripId) return
      setSaveError(null)
      saveLegsMutation.mutate(legs, {
        onError: (err) => {
          setSaveError(err instanceof Error ? err.message : "Nie udało się zapisać trasy.")
        },
      })
    },
    [saveLegsMutation, tripId],
  )

  const connectionStops = useMemo(
    (): PlannerDepartureStop[] =>
      visibleConnectionOptions.map((option) => ({
        id: option.stopId,
        cityId: option.cityId,
        name: option.destinationStopName,
        address: option.destinationAddress,
        position: option.position,
      })),
    [visibleConnectionOptions],
  )

  const activePickerStops = useMemo(
    () => (selectedCity ? pickerStops : []),
    [pickerStops, selectedCity],
  )

  const stopById = useMemo(() => {
    const map = new Map<string, PlannerDepartureStop>()
    for (const stop of activePickerStops) map.set(stop.id, stop)
    for (const stop of connectionStops) map.set(stop.id, stop)
    for (const leg of routeLegs) map.set(leg.stopId, legToDepartureStop(leg))
    return map
  }, [activePickerStops, connectionStops, routeLegs])

  const canPickStop = Boolean(selectedCity && departureDate && departureTime)
  const effectiveSelectedStopId =
    selectedStopId && stopById.has(selectedStopId) ? selectedStopId : null
  const canAddLeg = canPickStop && effectiveSelectedStopId !== null
  const canFinalize = routeLegs.length >= MIN_STOPS_TO_FINALIZE && !saving

  const selectedStop = effectiveSelectedStopId
    ? stopById.get(effectiveSelectedStopId)
    : undefined

  const handleSelectConnection = useCallback(
    (option: PlannerConnectionOption) => {
      const leg: PlannerRouteLeg = {
        id: createLegId(),
        ...connectionOptionToLeg(option, {
          readyDate,
          readyTime,
          waitingSeconds: waitingMinutes * 60,
        }),
      }

      const nextLegs = [...routeLegs, leg]
      setRouteLegs(nextLegs)
      setHoveredStopId(null)
      setZoomStopId(null)
      setSelectedStopId(null)
      setDestinationCityQuery("")
      setSelectedDestinationCity(null)
      void persistLegs(nextLegs)
    },
    [persistLegs, readyDate, readyTime, routeLegs, waitingMinutes],
  )

  const handleStopSelectFromMap = useCallback(
    (stopId: string) => {
      if (isFirstLeg) {
        if (canPickStop && activePickerStops.some((item) => item.id === stopId)) {
          setSelectedStopId(stopId)
        }
        return
      }

      const option = visibleConnectionOptions.find((item) => item.stopId === stopId)
      if (option) {
        handleSelectConnection(option)
      }
    },
    [
      canPickStop,
      handleSelectConnection,
      isFirstLeg,
      activePickerStops,
      visibleConnectionOptions,
    ],
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

  const handleDeleteTrip = () => {
    if (!tripId) return
    setSaveError(null)
    deleteTripMutation.mutate(tripId, {
      onSuccess: () => {
        setDeleteConfirmOpen(false)
        navigate("/planner")
      },
      onError: (err) => {
        setSaveError(err instanceof Error ? err.message : "Nie udało się usunąć podróży.")
        setDeleteConfirmOpen(false)
      },
    })
  }

  const handleFinalize = () => {
    if (!tripId) return
    setSaveError(null)
    finalizeMutation.mutate(undefined, {
      onSuccess: (ok) => {
        setConfirmOpen(false)
        if (ok) {
          navigate(tripSchedulePath(tripId))
        }
      },
      onError: (err) => {
        setSaveError(err instanceof Error ? err.message : "Nie udało się zatwierdzić trasy.")
      },
    })
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
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-2" asChild>
            <Link to="/planner">
              <ArrowLeft className="size-4" aria-hidden />
              Planowanie
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={deleteTripMutation.isPending}
            onClick={() => setDeleteConfirmOpen(true)}
          >
            <Trash2 className="size-4" aria-hidden />
            Usuń
          </Button>
        </div>
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
                  {isFirstLeg
                    ? "Miasto, data, godzina i przystanek — potem dodaj do trasy."
                    : "Podaj, od kiedy możesz czekać na autobus i wybierz połączenie z listy."}
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                {isFirstLeg ? (
                  <>
                    <div className="space-y-2">
                      <Label
                        htmlFor="planner-city"
                        className="text-[10px] uppercase tracking-wider"
                      >
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
                          {cityQuery.trim().length < 2 && (
                            <li className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Popularne miasta
                            </li>
                          )}
                          {cityResults.map((city) => (
                            <li key={city.id}>
                              <button
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                                onClick={() => {
                                  setSelectedCity(city)
                                  setCityQuery(city.label)
                                  setSearchedCityResults([])
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
                        <Label
                          htmlFor="planner-date"
                          className="text-[10px] uppercase tracking-wider"
                        >
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
                        <Label
                          htmlFor="planner-time"
                          className="text-[10px] uppercase tracking-wider"
                        >
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
                      <Label
                        htmlFor="planner-stop"
                        className="text-[10px] uppercase tracking-wider"
                      >
                        Przystanek
                      </Label>
                      <select
                        id="planner-stop"
                        className={selectClassName}
                        value={selectedStopId ?? ""}
                        disabled={!canPickStop || activePickerStops.length === 0}
                        onChange={(event) => {
                          const value = event.target.value
                          const stopId = value.length > 0 ? value : null
                          setSelectedStopId(stopId)
                          setZoomStopId(stopId)
                        }}
                      >
                        <option value="">
                          {canPickStop
                            ? activePickerStops.length > 0
                              ? "Wybierz przystanek…"
                              : "Ładowanie przystanków…"
                            : "Najpierw miasto, datę i godzinę"}
                        </option>
                        {activePickerStops.map((stop) => (
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
                  </>
                ) : (
                  <>
                    {lastLeg && (
                      <PlannerCurrentStopPreview
                        stopName={lastLeg.stopName}
                        address={lastLeg.address}
                        date={lastLeg.date}
                        time={lastLeg.time}
                      />
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label
                          htmlFor="planner-ready-date"
                          className="text-[10px] uppercase tracking-wider"
                        >
                          Gotowość od — data
                        </Label>
                        <Input
                          id="planner-ready-date"
                          type="date"
                          value={readyDate}
                          onChange={(event) => setReadyDate(event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="planner-ready-time"
                          className="text-[10px] uppercase tracking-wider"
                        >
                          Gotowość od — godzina
                        </Label>
                        <Input
                          id="planner-ready-time"
                          type="time"
                          value={readyTime}
                          onChange={(event) => setReadyTime(event.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="planner-destination-city"
                        className="text-[10px] uppercase tracking-wider"
                      >
                        Miasto docelowe (opcjonalnie)
                      </Label>
                      <Input
                        id="planner-destination-city"
                        value={destinationCityQuery}
                        placeholder="Filtruj połączenia do wybranego miasta"
                        onChange={(event) => {
                          setDestinationCityQuery(event.target.value)
                          setSelectedDestinationCity(null)
                        }}
                      />
                      {destinationCityResults.length > 0 && !selectedDestinationCity && (
                        <ul className="max-h-40 overflow-y-auto rounded-md border border-border">
                          {destinationCityQuery.trim().length < 2 && (
                            <li className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Popularne miasta
                            </li>
                          )}
                          {destinationCityResults.map((city) => (
                            <li key={city.id}>
                              <button
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                                onClick={() => {
                                  setSelectedDestinationCity(city)
                                  setDestinationCityQuery(city.label)
                                  setSearchedDestinationCityResults([])
                                }}
                              >
                                {city.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {selectedDestinationCity ? (
                        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span>
                            Cel: <span className="font-medium text-foreground">{selectedDestinationCity.label}</span>
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => {
                              setSelectedDestinationCity(null)
                              setDestinationCityQuery("")
                            }}
                          >
                            Wyczyść
                          </Button>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Bez wyboru miasta zobaczysz wszystkie dostępne kierunki.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="planner-waiting"
                        className="text-[10px] uppercase tracking-wider"
                      >
                        Maks. czas oczekiwania na autobus
                      </Label>
                      <select
                        id="planner-waiting"
                        className={selectClassName}
                        value={waitingMinutes}
                        onChange={(event) => setWaitingMinutes(Number(event.target.value))}
                      >
                        {WAITING_TIME_PRESETS.map((preset) => (
                          <option key={preset.minutes} value={preset.minutes}>
                            {preset.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground">
                        Backend szuka kursów, które odjadą w tym oknie od podanej godziny
                        gotowości.
                      </p>
                    </div>

                    <PlannerConnectionsList
                      items={visibleConnectionOptions}
                      loading={canSearchConnections && connectionsLoading}
                      error={canSearchConnections ? connectionsError : null}
                      destinationCityLabel={selectedDestinationCity?.label ?? null}
                      onSelect={handleSelectConnection}
                      onHover={(option) => setHoveredStopId(option?.stopId ?? null)}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <div className="relative min-h-[min(50vh,420px)] min-w-0 flex-1 lg:min-h-0">
          <PlannerMap
            cityCenter={
              isFirstLeg
                ? selectedCity?.mapCenter
                : (selectedDestinationCity?.mapCenter ?? lastLeg?.position)
            }
            cityZoom={selectedDestinationCity?.mapZoom ?? selectedCity?.mapZoom}
            departureDate={isFirstLeg ? departureDate : readyDate}
            departureTime={isFirstLeg ? departureTime : readyTime}
            routeLegs={routeLegs}
            pickerStops={isFirstLeg ? activePickerStops : []}
            recommendedStops={isFirstLeg ? [] : connectionStops}
            stopById={stopById}
            selectedStopId={effectiveSelectedStopId}
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

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Usunąć planowaną podróż?"
        description={`Czy na pewno chcesz usunąć „${trip.name}"? Tej operacji nie można cofnąć.`}
        confirmLabel={deleteTripMutation.isPending ? "Usuwanie…" : "Usuń podróż"}
        cancelLabel="Anuluj"
        onConfirm={handleDeleteTrip}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </PageLayout>
  )
}
