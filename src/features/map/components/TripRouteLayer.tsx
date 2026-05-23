import { memo, useMemo } from "react"
import { CircleMarker, Polyline, Popup } from "react-leaflet"

import { toLatLngTuple } from "@/domain/models/GeoPosition"
import type { TripMapLayer } from "@/features/map/tripMapUtils"

type TripRouteLayerProps = {
  layer: TripMapLayer
}

export const TripRouteLayer = memo(function TripRouteLayer({ layer }: TripRouteLayerProps) {
  const path = useMemo(
    () => layer.path.map((position) => toLatLngTuple(position)),
    [layer.path],
  )

  return (
    <>
      <Polyline
        positions={path}
        pathOptions={{
          color: layer.color,
          weight: 3,
          opacity: 0.9,
          lineCap: "round",
          lineJoin: "round",
        }}
      />
      {layer.stops.map((stop) => (
        <CircleMarker
          key={stop.id}
          center={toLatLngTuple(stop.position)}
          radius={7}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: layer.color,
            fillOpacity: 1,
          }}
        >
          <Popup>
            <span className="text-sm font-medium">{layer.name}</span>
            <br />
            <span className="text-xs text-muted-foreground">{stop.label}</span>
          </Popup>
        </CircleMarker>
      ))}
    </>
  )
})
