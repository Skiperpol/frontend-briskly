import type { FeatureCollection, LineString, Point } from "geojson"

import type { TripMapLayer } from "@/features/map/tripMapUtils"

export function buildRoutesGeoJson(layers: TripMapLayer[]): FeatureCollection<LineString> {
  return {
    type: "FeatureCollection",
    features: layers
      .filter((layer) => layer.path.length >= 2)
      .map((layer) => ({
        type: "Feature" as const,
        properties: {
          tripId: layer.tripId,
          name: layer.name,
          color: layer.color,
          dashed: Boolean(layer.dashed),
        },
        geometry: {
          type: "LineString" as const,
          coordinates: layer.path.map((position) => [position.lng, position.lat]),
        },
      })),
  }
}

export function buildStopsGeoJson(layers: TripMapLayer[]): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: layers.flatMap((layer) =>
      layer.stops.map((stop) => ({
        type: "Feature" as const,
        properties: {
          stopId: stop.id,
          tripId: layer.tripId,
          tripName: layer.name,
          label: stop.label,
          color: layer.color,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [stop.position.lng, stop.position.lat],
        },
      })),
    ),
  }
}
