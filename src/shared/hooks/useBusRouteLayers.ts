import { useEffect, useMemo, useRef, useState } from "react"

import { fetchRoadRoute } from "@/features/map/mapDirections"
import { getMapboxAccessToken } from "@/features/map/mapboxConfig"
import type { TripMapLayer } from "@/features/map/tripMapUtils"

export type BusRouteStatus = "idle" | "loading" | "ready" | "error"

const ROUTE_TIMEOUT_MS = 25_000

function buildLayersKey(layers: TripMapLayer[]): string {
  return layers
    .map(
      (layer) =>
        `${layer.tripId}:${layer.stops.map((stop) => `${stop.id}@${stop.position.lat},${stop.position.lng}`).join(";")}`,
    )
    .join("|")
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms)
    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch(() => {
        clearTimeout(timer)
        resolve(fallback)
      })
  })
}

export function useBusRouteLayers(baseLayers: TripMapLayer[]) {
  const layersKey = useMemo(() => buildLayersKey(baseLayers), [baseLayers])
  const [layers, setLayers] = useState<TripMapLayer[]>(() =>
    baseLayers.map((layer) => ({ ...layer, path: [] })),
  )
  const [status, setStatus] = useState<BusRouteStatus>("idle")
  const runIdRef = useRef(0)
  const baseLayersRef = useRef(baseLayers)
  baseLayersRef.current = baseLayers

  useEffect(() => {
    const runId = ++runIdRef.current
    let cancelled = false
    const currentBaseLayers = baseLayersRef.current

    setLayers(currentBaseLayers.map((layer) => ({ ...layer, path: [] })))

    const loadRoutes = async () => {
      if (currentBaseLayers.length === 0) {
        setLayers([])
        setStatus("ready")
        return
      }

      const token = getMapboxAccessToken()
      if (!token) {
        setStatus("error")
        return
      }

      setStatus("loading")

      try {
        const routedLayers = await Promise.all(
          currentBaseLayers.map(async (layer) => {
            const stations = layer.stops.map((stop) => stop.position)
            const roadPath = await withTimeout(
              fetchRoadRoute(stations, token),
              ROUTE_TIMEOUT_MS,
              [],
            )

            return {
              ...layer,
              path: roadPath.length >= 2 ? roadPath : [],
            }
          }),
        )

        if (!cancelled && runId === runIdRef.current) {
          setLayers(routedLayers)
          setStatus("ready")
        }
      } catch {
        if (!cancelled && runId === runIdRef.current) {
          setStatus("error")
        }
      }
    }

    void loadRoutes()

    return () => {
      cancelled = true
    }
  }, [layersKey])

  return { layers, status }
}
