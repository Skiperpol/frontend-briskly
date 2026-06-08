import type { ApiConnection } from "@/shared/api/types"

export function stopIdToConnectionId(
  scheduleStopId: string,
  connections: ApiConnection[],
): number | undefined {
  const rawStopId = scheduleStopId.replace(/^stop-/, "")
  const destinationMatch = connections.find(
    (connection) => connection.destination_stop.stop_id === rawStopId,
  )
  if (destinationMatch) return destinationMatch.id

  const first = connections[0]
  if (first && first.starting_stop.stop_id === rawStopId) {
    return first.id
  }

  return undefined
}
