import { MapContainer, TileLayer } from "react-leaflet"

import type { LatLngTuple } from "@/domain/models/GeoPosition"
import { MapFocusBounds } from "@/features/map/components/MapFocusBounds"
import { TripRouteLayer } from "@/features/map/components/TripRouteLayer"
import type { TripMapLayer } from "@/features/map/tripMapUtils"

import "leaflet/dist/leaflet.css"

const DEFAULT_CENTER: LatLngTuple = [30, 10]
const DEFAULT_ZOOM = 2

type GlobalMapProps = {
  layers: TripMapLayer[]
  focusPositions: LatLngTuple[]
  focusKey: string
}

export function GlobalMap({ layers, focusPositions, focusKey }: GlobalMapProps) {
  const maxZoom = focusKey === "all" ? 5 : 14

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full z-0 bg-[#aad3df]"
      preferCanvas
      zoomControl
      maxZoom={18}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        noWrap
      />
      {layers.map((layer) => (
        <TripRouteLayer key={layer.tripId} layer={layer} />
      ))}
      <MapFocusBounds
        positions={focusPositions}
        focusKey={focusKey}
        maxZoom={maxZoom}
      />
    </MapContainer>
  )
}
