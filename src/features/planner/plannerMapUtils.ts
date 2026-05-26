import type { GeoPosition } from "@/domain/models/GeoPosition"
import type { TripMapLayer } from "@/features/map/tripMapUtils"
import { TRIP_MAP_COLORS } from "@/features/map/tripMapConstants"
import type {
  PlannerDepartureStop,
  PlannerRouteLeg,
} from "@/features/planner/types"

const PREVIEW_ROUTE_COLOR = "#60a5fa"

const RECOMMENDED_COLOR = "#f59e0b"

export function buildPickerMapLayer(
  stops: PlannerDepartureStop[],
  layerId: string,
): TripMapLayer | null {
  if (stops.length === 0) return null

  return {
    tripId: layerId,
    name: "Dostępne przystanki",
    color: TRIP_MAP_COLORS[0] as string,
    path: [],
    stops: stops.map((stop) => ({
      id: stop.id,
      label: stop.name,
      position: stop.position,
    })),
  }
}

export function buildPreviewMapLayer(
  from: GeoPosition,
  fromLabel: string,
  to: PlannerDepartureStop,
): TripMapLayer {
  return {
    tripId: "planner-preview",
    name: "Podgląd trasy",
    color: PREVIEW_ROUTE_COLOR,
    dashed: true,
    path: [],
    stops: [
      { id: "preview-from", label: fromLabel, position: from },
      { id: to.id, label: to.name, position: to.position },
    ],
  }
}

export function buildRouteMapLayer(legs: PlannerRouteLeg[]): TripMapLayer | null {
  if (legs.length === 0) return null

  return {
    tripId: "planner-route",
    name: "Twoja trasa",
    color: TRIP_MAP_COLORS[1] as string,
    path: [],
    stops: legs.map((leg, index) => ({
      id: `route-${leg.id}`,
      label: `${index + 1}. ${leg.stopName}`,
      position: leg.position,
    })),
  }
}

export function buildRecommendedMapLayer(
  stops: PlannerDepartureStop[],
): TripMapLayer | null {
  if (stops.length === 0) return null

  return {
    tripId: "planner-recommended",
    name: "Polecane w okolicy",
    color: RECOMMENDED_COLOR,
    path: [],
    stops: stops.map((stop) => ({
      id: stop.id,
      label: stop.name,
      position: stop.position,
    })),
  }
}
