import { useMemo, useState } from "react"

import { toLatLngTuple } from "@/domain/models/GeoPosition"
import { GlobalMap } from "@/features/map/components/GlobalMap"
import { MapTripList } from "@/features/map/components/MapTripList"
import { collectAllPositions } from "@/features/map/tripMapUtils"
import { PageLayout } from "@/shared/components/layout/PageLayout"
import { useTripData } from "@/shared/hooks/useTripData"

export function GlobalMapPage() {
  const { tripMapLayers, journalTrips, stats } = useTripData()
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)

  const focusPositions = useMemo(() => {
    if (!selectedTripId) {
      return collectAllPositions(tripMapLayers).map((position) => toLatLngTuple(position))
    }

    const layer = tripMapLayers.find((item) => item.tripId === selectedTripId)
    if (!layer) {
      return collectAllPositions(tripMapLayers).map((position) => toLatLngTuple(position))
    }

    return collectAllPositions([layer]).map((position) => toLatLngTuple(position))
  }, [selectedTripId, tripMapLayers])

  const focusKey = selectedTripId ?? "all"

  return (
    <PageLayout title="Mapa globalna">
      <div className="flex min-h-0 flex-1">
        <div className="relative min-h-0 min-w-0 flex-1">
          <GlobalMap
            layers={tripMapLayers}
            focusPositions={focusPositions}
            focusKey={focusKey}
          />
        </div>
        <aside className="flex w-80 shrink-0 flex-col border-l border-sidebar-border bg-sidebar p-4">
          <MapTripList
            layers={tripMapLayers}
            trips={journalTrips}
            selectedTripId={selectedTripId}
            onSelectTrip={setSelectedTripId}
            tripCount={tripMapLayers.length}
            totalKilometers={stats.totalKilometers}
          />
        </aside>
      </div>
    </PageLayout>
  )
}
