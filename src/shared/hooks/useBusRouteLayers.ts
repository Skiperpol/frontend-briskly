import { useEffect, useRef, useState } from "react"

import { fetchRoadRoute } from "@/features/map/mapDirections"
import { getMapboxAccessToken } from "@/features/map/mapboxConfig"
import type { TripMapLayer } from "@/features/map/tripMapUtils"

export type BusRouteStatus = "idle" | "loading" | "ready" | "error"

const ROUTE_TIMEOUT_MS = 25_000

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
  const [layers, setLayers] = useState<TripMapLayer[]>(() =>
    baseLayers.map((layer) => ({ ...layer, path: [] })),
  )
  const [status, setStatus] = useState<BusRouteStatus>("idle")
  const runIdRef = useRef(0)

  useEffect(() => {
    const runId = ++runIdRef.current
    let cancelled = false

    setLayers(baseLayers.map((layer) => ({ ...layer, path: [] })))

    const loadRoutes = async () => {
      if (baseLayers.length === 0) {
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
        for (const layer of baseLayers) {
          if (cancelled || runId !== runIdRef.current) break

          const stations = layer.stops.map((stop) => stop.position)
          const roadPath = await withTimeout(
            fetchRoadRoute(stations, token),
            ROUTE_TIMEOUT_MS,
            [],
          )

          if (cancelled || runId !== runIdRef.current) break

          setLayers((previous) =>
            previous.map((item) =>
              item.tripId === layer.tripId
                ? { ...layer, path: roadPath.length >= 2 ? roadPath : [] }
                : item,
            ),
          )
        }

        if (!cancelled && runId === runIdRef.current) {
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
  }, [baseLayers])

  return { layers, status }
}
