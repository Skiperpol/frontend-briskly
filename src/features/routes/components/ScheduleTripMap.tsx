import { useMemo, useState } from "react"

import type { UserTrip } from "@/domain/models"
import { toLatLngTuple } from "@/domain/models/GeoPosition"
import { GlobalMap } from "@/features/map/components/GlobalMap"
import { DEFAULT_MAP_STYLE_ID } from "@/features/map/mapStyles"
import { buildTripMapLayers, collectStopPositions } from "@/features/map/tripMapUtils"
import { useBusRouteLayers } from "@/shared/hooks/useBusRouteLayers"

type ScheduleTripMapProps = {
  trip: UserTrip
  /** `null` — cała trasa; inaczej id przystanku harmonogramu. */
  focusedStopId: string | null
}

export function ScheduleTripMap({ trip, focusedStopId }: ScheduleTripMapProps) {
  const baseLayers = useMemo(() => buildTripMapLayers([trip]), [trip])
  const { layers: routeLayers, status } = useBusRouteLayers(baseLayers)
  const [mapStyleId] = useState(DEFAULT_MAP_STYLE_ID)

  const focusPositions = useMemo(() => {
    if (!focusedStopId) {
      return collectStopPositions(baseLayers).map((position) => toLatLngTuple(position))
    }

    const stop = trip.scheduleStops.find((item) => item.id === focusedStopId)
    if (stop?.position) {
      return [toLatLngTuple(stop.position)]
    }

    return collectStopPositions(baseLayers).map((position) => toLatLngTuple(position))
  }, [baseLayers, focusedStopId, trip.scheduleStops])

  const focusKey = focusedStopId ?? `route-${trip.id}`

  return (
    <div className="relative h-full min-h-0 w-full lg:min-h-[280px]">
      <GlobalMap
        layers={routeLayers}
        focusPositions={focusPositions}
        focusKey={focusKey}
        mapStyleId={mapStyleId}
        pointFocusZoom={14}
      />
      {status === "loading" && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-md bg-background/95 px-3 py-2 text-xs text-muted-foreground shadow-md backdrop-blur">
          Wyznaczanie trasy…
        </div>
      )}
      {status === "error" && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-xs rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive shadow-md backdrop-blur">
          Nie udało się wyznaczyć trasy. Sprawdź token Mapbox w pliku .env.
        </div>
      )}
    </div>
  )
}
