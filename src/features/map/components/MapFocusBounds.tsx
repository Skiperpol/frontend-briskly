import { useEffect } from "react"
import { useMap } from "react-leaflet"

import type { LatLngTuple } from "@/domain/models/GeoPosition"
import {
  applyTripView,
  applyWorldView,
  clearMapViewConstraints,
  positionsToBounds,
} from "@/features/map/mapBoundsUtils"

type MapFocusBoundsProps = {
  positions: LatLngTuple[]
  focusKey: string
  maxZoom?: number
}

export function MapFocusBounds({ positions, focusKey, maxZoom = 14 }: MapFocusBoundsProps) {
  const map = useMap()
  const isWorldView = focusKey === "all"

  useEffect(() => {
    map.invalidateSize()

    if (isWorldView) {
      applyWorldView(map)
    } else if (positions.length > 0) {
      const bounds = positionsToBounds(positions)
      if (bounds) {
        applyTripView(map, bounds, maxZoom)
      }
    }

    const onResize = () => {
      map.invalidateSize()
    }

    map.on("resize", onResize)

    return () => {
      map.off("resize", onResize)
      clearMapViewConstraints(map)
    }
  }, [map, positions, focusKey, maxZoom, isWorldView])

  return null
}
