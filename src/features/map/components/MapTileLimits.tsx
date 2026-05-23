import { useEffect } from "react"
import { useMap } from "react-leaflet"

import { setupLatitudeClamp } from "@/features/map/mapBoundsUtils"

export function MapTileLimits() {
  const map = useMap()

  useEffect(() => setupLatitudeClamp(map), [map])

  return null
}
