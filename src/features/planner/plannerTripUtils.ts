import { RouteLeg, ScheduleStop } from "@/domain/models"
import type { PlannerRouteLeg } from "@/features/planner/types"

export function plannerLegsToTripRoute(legs: PlannerRouteLeg[]): {
  scheduleStops: ScheduleStop[]
  routeLegs: RouteLeg[]
  mapPath: PlannerRouteLeg["position"][]
} {
  if (legs.length === 0) {
    return { scheduleStops: [], routeLegs: [], mapPath: [] }
  }

  const scheduleStops = legs.map(
    (leg) =>
      new ScheduleStop(
        leg.id,
        "bus",
        leg.time,
        leg.stopName,
        `${leg.cityLabel} · ${leg.address}`,
        { Data: leg.date },
        undefined,
        undefined,
        [],
        leg.position,
      ),
  )

  const routeLegs: RouteLeg[] = []
  for (let index = 1; index < legs.length; index += 1) {
    const previous = legs[index - 1]!
    const current = legs[index]!
    routeLegs.push(
      new RouteLeg(
        `route-${previous.id}-${current.id}`,
        "bus",
        previous.stopName,
        current.stopName,
        "Flixbus",
        "—",
        "Planowana",
      ),
    )
  }

  return {
    scheduleStops,
    routeLegs,
    mapPath: legs.map((leg) => leg.position),
  }
}

export function tripStopsToPlannerLegs(
  stops: ScheduleStop[],
): PlannerRouteLeg[] {
  return stops
    .filter((stop) => stop.position)
    .map((stop) => {
      const dateDetail = stop.details.Data ?? ""
      return {
        id: stop.id,
        cityId: "",
        cityLabel: stop.subtitle.split(" · ")[0] ?? stop.subtitle,
        stopId: stop.id,
        stopName: stop.title,
        address: stop.subtitle.includes(" · ")
          ? stop.subtitle.split(" · ").slice(1).join(" · ")
          : stop.subtitle,
        position: stop.position!,
        date: dateDetail,
        time: stop.time,
      }
    })
}
