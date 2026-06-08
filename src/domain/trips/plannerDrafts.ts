import type { PlannerRouteLeg } from "@/features/planner/types"

const draftLegsByTrip = new Map<string, PlannerRouteLeg[]>()

export function getPlannerDraftLegs(tripId: string): PlannerRouteLeg[] | undefined {
  return draftLegsByTrip.get(tripId)
}

export function setPlannerDraftLegs(tripId: string, legs: PlannerRouteLeg[]): void {
  draftLegsByTrip.set(tripId, legs)
}

export function clearPlannerDraftLegs(tripId: string): void {
  draftLegsByTrip.delete(tripId)
}
