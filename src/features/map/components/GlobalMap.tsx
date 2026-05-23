import { MapContainer, TileLayer } from "react-leaflet"

import type { LatLngTuple } from "@/domain/models/GeoPosition"
import { MapFocusBounds } from "@/features/map/components/MapFocusBounds"
import { MapTileLimits } from "@/features/map/components/MapTileLimits"
import { TripRouteLayer } from "@/features/map/components/TripRouteLayer"
import { getMapStyle, type MapStyleId } from "@/features/map/mapStyles"
import type { TripMapLayer } from "@/features/map/tripMapUtils"

import "leaflet/dist/leaflet.css"

const DEFAULT_CENTER: LatLngTuple = [30, 10]
const DEFAULT_ZOOM = 2

type GlobalMapProps = {
  layers: TripMapLayer[]
  focusPositions: LatLngTuple[]
  focusKey: string
  mapStyleId: MapStyleId
}

export function GlobalMap({ layers, focusPositions, focusKey, mapStyleId }: GlobalMapProps) {
  const maxZoom = focusKey === "all" ? 5 : 14
  const mapStyle = getMapStyle(mapStyleId)

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full z-0"
      style={{ background: mapStyle.background }}
      preferCanvas
      zoomControl
      minZoom={2}
      maxZoom={18}
      worldCopyJump
    >
      <MapTileLimits />
      {mapStyle.layers.map((layer, index) => (
        <TileLayer
          key={`${mapStyleId}-${index}`}
          url={layer.url}
          attribution={layer.attribution}
          opacity={layer.opacity}
          maxNativeZoom={layer.maxNativeZoom}
        />
      ))}
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
