import { useEffect } from "react"
import { useMap } from "react-leaflet"

import type { LatLngTuple } from "@/domain/models/GeoPosition"
import {
  applyMapViewConstraints,
  applyWorldView,
  clearMapViewConstraints,
  positionsToBounds,
} from "@/features/map/mapBoundsUtils"

type MapFocusBoundsProps = {
  positions: LatLngTuple[]
  focusKey: string
  maxZoom?: number
}

const VERTICAL_PADDING = 8
const HORIZONTAL_PADDING = 16

export function MapFocusBounds({ positions, focusKey, maxZoom = 14 }: MapFocusBoundsProps) {
  const map = useMap()
  const isWorldView = focusKey === "all"

  useEffect(() => {
    map.invalidateSize()

    let minZoom = 0

    const applyView = () => {
      if (isWorldView) {
        minZoom = applyWorldView(map)
        return
      }

      if (positions.length === 0) return

      const bounds = positionsToBounds(positions)
      if (!bounds) return

      minZoom = applyMapViewConstraints(map, bounds, {
        verticalPadding: VERTICAL_PADDING,
        horizontalPadding: HORIZONTAL_PADDING,
        maxZoom,
      })
    }

    applyView()

    const enforceMinZoom = () => {
      if (map.getZoom() < minZoom) {
        map.setZoom(minZoom)
      }
    }

    map.on("zoom", enforceMinZoom)
    map.on("zoomend", enforceMinZoom)

    const onResize = () => {
      map.invalidateSize()
      applyView()
    }

    map.on("resize", onResize)

    return () => {
      map.off("zoom", enforceMinZoom)
      map.off("zoomend", enforceMinZoom)
      map.off("resize", onResize)
      clearMapViewConstraints(map)
    }
  }, [map, positions, focusKey, maxZoom, isWorldView])

  return null
}
