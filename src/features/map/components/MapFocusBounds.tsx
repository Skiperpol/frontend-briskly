import { useEffect } from "react"
import L from "leaflet"
import { useMap } from "react-leaflet"

import type { LatLngTuple } from "@/domain/models/GeoPosition"

type MapFocusBoundsProps = {
  positions: LatLngTuple[]
  focusKey: string
  maxZoom?: number
}

export function MapFocusBounds({ positions, focusKey, maxZoom = 8 }: MapFocusBoundsProps) {
  const map = useMap()

  useEffect(() => {
    if (positions.length === 0) return

    const bounds = L.latLngBounds(positions)
    map.flyToBounds(bounds, {
      padding: [48, 48],
      maxZoom,
      duration: 0.6,
    })
  }, [map, positions, focusKey, maxZoom])

  return null
}
