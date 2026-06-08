import { useCallback, useEffect, useState } from "react"

import type { UserTrip } from "@/domain/models"
import { TripService } from "@/domain/services"

export function useTrip(tripId: string | undefined) {
  const [trip, setTrip] = useState<UserTrip | undefined>()
  const [loading, setLoading] = useState(Boolean(tripId))
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1)
  }, [])

  useEffect(() => {
    if (!tripId) {
      setTrip(undefined)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        const service = TripService.getInstance()
        await service.ensureLoaded()

        const loaded = await service.loadTripDetail(tripId)

        if (!cancelled) {
          setTrip(loaded)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Nie udało się załadować podróży.")
          setTrip(undefined)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [tripId, reloadToken])

  return { trip, loading, error, reload }
}
