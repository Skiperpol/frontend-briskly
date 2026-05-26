import type { GeoPosition } from "@/domain/models/GeoPosition"

type DirectionsResponse = {
  code: string
  message?: string
  routes?: {
    geometry: {
      type: string
      coordinates: [number, number][]
    }
  }[]
}

/**
 * Trasa po drogach (Mapbox Directions — profil driving, jak autobus Flixbus).
 * Współrzędne: stacja A → stacja B (opcjonalnie przystanki po drodze).
 */
export async function fetchRoadRoute(
  stations: GeoPosition[],
  accessToken: string,
): Promise<GeoPosition[]> {
  if (stations.length < 2) {
    return stations.length === 1 ? [...stations] : []
  }

  const coordinatePath = stations
    .map((station) => `${station.lng},${station.lat}`)
    .join(";")

  const url = new URL(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatePath}`,
  )
  url.searchParams.set("geometries", "geojson")
  url.searchParams.set("overview", "full")
  url.searchParams.set("steps", "false")
  url.searchParams.set("access_token", accessToken)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20_000)

  try {
    const response = await fetch(url, { signal: controller.signal })
    const data = (await response.json()) as DirectionsResponse

    if (!response.ok || data.code !== "Ok" || !data.routes?.[0]?.geometry) {
      throw new Error(data.message ?? `Directions API: ${data.code}`)
    }

    return data.routes[0].geometry.coordinates.map(([lng, lat]) => ({
      lat,
      lng,
    }))
  } finally {
    clearTimeout(timeoutId)
  }
}
