import { useMemo, useState } from "react"

import { toLatLngTuple } from "@/domain/models/GeoPosition"
import { GlobalMap } from "@/features/map/components/GlobalMap"
import { DEFAULT_MAP_STYLE_ID } from "@/features/map/mapStyles"
import { collectAllPositions } from "@/features/map/tripMapUtils"
import {
  buildPickerMapLayer,
  buildPreviewMapLayer,
  buildRecommendedMapLayer,
  buildRouteMapLayer,
} from "@/features/planner/plannerMapUtils"
import type { GeoPosition } from "@/domain/models/GeoPosition"
import type {
  PlannerDepartureStop,
  PlannerRouteLeg,
} from "@/features/planner/types"
import { useBusRouteLayers } from "@/shared/hooks/useBusRouteLayers"

type PlannerMapProps = {
  cityCenter?: GeoPosition
  cityZoom?: number
  departureDate: string
  departureTime: string
  routeLegs: PlannerRouteLeg[]
  pickerStops: PlannerDepartureStop[]
  recommendedStops: PlannerDepartureStop[]
  stopById: Map<string, PlannerDepartureStop>
  selectedStopId: string | null
  hoveredStopId: string | null
  /** Ustawiane tylko z selecta — steruje przybliżeniem mapy. */
  zoomStopId: string | null
  onStopSelect: (stopId: string) => void
  onStopHover: (stopId: string | null) => void
}

export function PlannerMap({
  cityCenter,
  cityZoom = 11,
  departureDate,
  departureTime,
  routeLegs,
  pickerStops,
  recommendedStops,
  stopById,
  selectedStopId,
  hoveredStopId,
  zoomStopId,
  onStopSelect,
  onStopHover,
}: PlannerMapProps) {
  const [mapStyleId] = useState(DEFAULT_MAP_STYLE_ID)
  const canPickStop = Boolean(cityCenter && departureDate && departureTime)
  const showRecommended = routeLegs.length > 0 && recommendedStops.length > 0
  const lastLeg = routeLegs.length > 0 ? routeLegs[routeLegs.length - 1] : null

  const previewTargetId = hoveredStopId ?? selectedStopId
  const previewStop = previewTargetId ? stopById.get(previewTargetId) : undefined
  const zoomStop = zoomStopId ? stopById.get(zoomStopId) : undefined

  const routeBaseLayers = useMemo(() => {
    const routeLayer = buildRouteMapLayer(routeLegs)
    return routeLayer ? [routeLayer] : []
  }, [routeLegs])

  const previewBaseLayers = useMemo(() => {
    if (!lastLeg || !previewStop) return []
    if (previewStop.id === lastLeg.stopId) return []
    return [buildPreviewMapLayer(lastLeg.position, lastLeg.stopName, previewStop)]
  }, [lastLeg, previewStop])

  const zoomPreviewBaseLayers = useMemo(() => {
    if (!zoomStopId || !lastLeg || !zoomStop) return []
    if (zoomStop.id === lastLeg.stopId) return []
    return [buildPreviewMapLayer(lastLeg.position, lastLeg.stopName, zoomStop)]
  }, [lastLeg, zoomStop, zoomStopId])

  const { layers: routedLayers, status: routeStatus } = useBusRouteLayers(routeBaseLayers)
  const { layers: previewLayers, status: previewStatus } = useBusRouteLayers(previewBaseLayers)
  const { layers: zoomPreviewLayers, status: zoomPreviewStatus } =
    useBusRouteLayers(zoomPreviewBaseLayers)

  const overlayLayers = useMemo(() => {
    const result = []

    if (showRecommended) {
      const recommendedLayer = buildRecommendedMapLayer(recommendedStops)
      if (recommendedLayer) result.push(recommendedLayer)
    }

    if (canPickStop && pickerStops.length > 0) {
      const pickerLayer = buildPickerMapLayer(pickerStops, "planner-picker")
      if (pickerLayer) result.push(pickerLayer)
    }

    return result
  }, [canPickStop, pickerStops, recommendedStops, showRecommended])

  const layers = useMemo(
    () => [...routedLayers, ...previewLayers, ...overlayLayers],
    [overlayLayers, previewLayers, routedLayers],
  )

  const selectableStopIds = useMemo(() => {
    const ids = new Set<string>()
    pickerStops.forEach((stop) => ids.add(stop.id))
    if (showRecommended) {
      recommendedStops.forEach((stop) => ids.add(stop.id))
    }
    return [...ids]
  }, [pickerStops, recommendedStops, showRecommended])

  const zoomPath = zoomPreviewLayers[0]?.path ?? []
  const zoomPathReady = zoomPath.length >= 2

  const focusPositions = useMemo(() => {
    if (zoomStopId && lastLeg) {
      if (zoomPathReady) {
        return zoomPath.map((position) => toLatLngTuple(position))
      }
      return []
    }

    if (routeLegs.length > 0) {
      const fromRoute = collectAllPositions(routedLayers).map((position) =>
        toLatLngTuple(position),
      )
      if (fromRoute.length > 0) return fromRoute
    }

    if (canPickStop && pickerStops.length > 0) {
      return pickerStops.map((stop) => toLatLngTuple(stop.position))
    }

    if (cityCenter) {
      return [toLatLngTuple(cityCenter)]
    }

    return []
  }, [
    canPickStop,
    cityCenter,
    lastLeg,
    pickerStops,
    routeLegs.length,
    routedLayers,
    zoomPath,
    zoomPathReady,
    zoomStopId,
  ])

  const focusKey = [
    "planner",
    routeLegs.map((leg) => leg.id).join(","),
    cityCenter ? `${cityCenter.lat},${cityCenter.lng}` : "no-city",
    zoomStopId ? `${zoomStopId}-${zoomPathReady ? "ready" : "pending"}` : "overview",
  ].join("|")

  const pointFocusZoom =
    focusPositions.length === 1 && !zoomStopId ? cityZoom : undefined

  const canInteract = selectableStopIds.length > 0
  const showHoverPreview = previewBaseLayers.length > 0
  const showZoomPending = Boolean(zoomStopId && !zoomPathReady && zoomPreviewStatus === "loading")

  return (
    <div className="relative h-full min-h-[280px] w-full">
      <GlobalMap
        layers={layers}
        focusPositions={focusPositions}
        focusKey={focusKey}
        mapStyleId={mapStyleId}
        pointFocusZoom={pointFocusZoom}
        selectedStopId={selectedStopId}
        hoveredStopId={hoveredStopId}
        onStopSelect={canInteract ? onStopSelect : undefined}
        onStopHover={canInteract ? onStopHover : undefined}
        selectableStopIds={selectableStopIds}
      />
      {routeLegs.length === 0 && !canPickStop && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 mx-4 rounded-md bg-background/95 px-3 py-2 text-center text-xs text-muted-foreground shadow-md backdrop-blur">
          Wybierz miasto, datę i godzinę, aby zobaczyć przystanki Flixbus.
        </div>
      )}
      {showHoverPreview && previewStatus === "loading" && !showZoomPending && (
        <div className="pointer-events-none absolute bottom-4 right-4 z-10 rounded-md bg-background/95 px-3 py-2 text-xs text-muted-foreground shadow-md backdrop-blur">
          Podgląd trasy…
        </div>
      )}
      {showHoverPreview && previewStatus !== "loading" && (
        <div className="pointer-events-none absolute inset-x-0 top-4 z-10 mx-4 rounded-md bg-background/95 px-3 py-2 text-center text-xs text-muted-foreground shadow-md backdrop-blur">
          Niebieska przerywana linia — podgląd (najechanie lub wybór, bez przesuwania mapy).
        </div>
      )}
      {showZoomPending && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-md bg-background/95 px-3 py-2 text-xs text-muted-foreground shadow-md backdrop-blur">
          Przybliżanie do trasy…
        </div>
      )}
      {routeLegs.length > 0 && showRecommended && !showHoverPreview && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 mx-4 rounded-md bg-background/95 px-3 py-2 text-center text-xs text-muted-foreground shadow-md backdrop-blur">
          Pomarańczowe markery — polecane przystanki w okolicy ostatniego punktu.
        </div>
      )}
      {routeLegs.length >= 2 && routeStatus === "loading" && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-md bg-background/95 px-3 py-2 text-xs text-muted-foreground shadow-md backdrop-blur">
          Wyznaczanie trasy po drogach…
        </div>
      )}
      {routeLegs.length >= 2 && routeStatus === "error" && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-xs rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive shadow-md backdrop-blur">
          Nie udało się wyznaczyć trasy. Sprawdź token Mapbox w pliku .env.
        </div>
      )}
    </div>
  )
}
