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
      className="h-full w-full z-0 bg-[#1a3d2e]"
      preferCanvas
      zoomControl
      minZoom={2}
      maxZoom={18}
      worldCopyJump
    >
      <TileLayer
        attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a> — Earthstar Geographics'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        maxNativeZoom={19}
      />
      <TileLayer
        attribution="Labels &copy; Esri"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        opacity={0.85}
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
