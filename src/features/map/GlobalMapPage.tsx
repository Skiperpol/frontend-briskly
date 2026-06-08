import { useMemo, useState } from "react"

import { toLatLngTuple } from "@/domain/models/GeoPosition"
import {
  GlobalMap,
  MAP_CAMERA_IDLE,
  MAP_CAMERA_OVERVIEW,
} from "@/features/map/components/GlobalMap"
import { MapStyleSwitcher } from "@/features/map/components/MapStyleSwitcher"
import { MapTripList } from "@/features/map/components/MapTripList"
import { DEFAULT_MAP_STYLE_ID, type MapStyleId } from "@/features/map/mapStyles"
import { collectStopPositions } from "@/features/map/tripMapUtils"
import { PageLayout } from "@/shared/components/layout/PageLayout"
import { TripNameSearch } from "@/shared/components/TripNameSearch"
import { useBusRouteLayers } from "@/shared/hooks/useBusRouteLayers"
import { useTripData } from "@/shared/hooks/useTripData"
import { filterTripsByName } from "@/shared/lib/tripSearch"
import { computeTotalKilometers } from "@/shared/lib/tripStats"

export function GlobalMapPage() {
  const { tripMapLayers, journalTrips, tripBundles, loading, error } = useTripData()
  const { layers: routeLayers, status: routeStatus } = useBusRouteLayers(tripMapLayers)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [mapView, setMapView] = useState<"overview" | "trip" | "manual">("overview")
  const [mapStyleId, setMapStyleId] = useState<MapStyleId>(DEFAULT_MAP_STYLE_ID)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTrips = useMemo(
    () => filterTripsByName(journalTrips, searchQuery),
    [journalTrips, searchQuery],
  )

  const filteredTripIds = useMemo(
    () => new Set(filteredTrips.map((trip) => trip.id)),
    [filteredTrips],
  )

  const filteredLayers = useMemo(
    () => routeLayers.filter((layer) => filteredTripIds.has(layer.tripId)),
    [filteredTripIds, routeLayers],
  )

  const activeTripId =
    selectedTripId && filteredTripIds.has(selectedTripId) ? selectedTripId : null

  const effectiveMapView = useMemo(() => {
    if (mapView === "trip" && selectedTripId && !filteredTripIds.has(selectedTripId)) {
      return "manual" as const
    }
    return mapView
  }, [filteredTripIds, mapView, selectedTripId])

  const focusPositions = useMemo(() => {
    if (!activeTripId) return []

    return collectStopPositions(
      tripMapLayers.filter((layer) => layer.tripId === activeTripId),
    ).map((position) => toLatLngTuple(position))
  }, [activeTripId, tripMapLayers])

  const focusKey =
    effectiveMapView === "trip" && activeTripId
      ? activeTripId
      : effectiveMapView === "overview"
        ? MAP_CAMERA_OVERVIEW
        : MAP_CAMERA_IDLE

  const handleSelectTrip = (tripId: string) => {
    if (selectedTripId === tripId) {
      setSelectedTripId(null)
      setMapView("overview")
      return
    }

    setSelectedTripId(tripId)
    setMapView("trip")
  }

  const filteredTotalKilometers = useMemo(() => {
    const connections = tripBundles
      .filter((bundle) => filteredTripIds.has(bundle.trip.id))
      .flatMap((bundle) => bundle.connections)

    return computeTotalKilometers(connections)
  }, [filteredTripIds, tripBundles])

  return (
    <PageLayout title="Mapa tras Flixbus">
      <div className="flex min-h-0 flex-1">
        <div className="relative min-h-0 min-w-0 flex-1">
          <GlobalMap
            layers={filteredLayers}
            focusPositions={focusPositions}
            focusKey={focusKey}
            highlightedTripId={activeTripId}
            mapStyleId={mapStyleId}
          />
          {routeStatus === "loading" && (
            <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-md bg-background/95 px-3 py-2 text-xs text-muted-foreground shadow-md backdrop-blur">
              Wyznaczanie tras po drogach (Mapbox)…
            </div>
          )}
          {routeStatus === "ready" && (
            <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-md bg-background/90 px-3 py-1.5 text-[10px] text-muted-foreground shadow-sm backdrop-blur">
              Trasy autobusowe wzdłuż dróg (Mapbox Directions)
            </div>
          )}
          {routeStatus === "error" && (
            <div className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-xs rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive shadow-md backdrop-blur">
              Nie udało się wyznaczyć tras. Sprawdź token Mapbox w pliku .env.
            </div>
          )}
          <div className="pointer-events-none absolute top-4 right-4 z-10">
            <div className="pointer-events-auto">
              <MapStyleSwitcher value={mapStyleId} onChange={setMapStyleId} />
            </div>
          </div>
        </div>
        <aside className="flex w-80 shrink-0 flex-col border-l border-sidebar-border bg-sidebar p-4">
          {loading && (
            <p className="mb-3 text-xs text-muted-foreground">Ładowanie podróży…</p>
          )}
          {error && (
            <p className="mb-3 rounded-md bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
              {error}
            </p>
          )}
          <TripNameSearch
            id="map-trip-search"
            value={searchQuery}
            onChange={setSearchQuery}
            className="shrink-0"
          />
          <MapTripList
            className="mt-3 min-h-0 flex-1"
            layers={filteredLayers}
            trips={filteredTrips}
            selectedTripId={activeTripId}
            onSelectTrip={handleSelectTrip}
            tripCount={filteredLayers.length}
            totalKilometers={filteredTotalKilometers}
            emptyMessage={
              searchQuery.trim()
                ? "Brak wycieczek pasujących do wyszukiwania."
                : undefined
            }
          />
        </aside>
      </div>
    </PageLayout>
  )
}
