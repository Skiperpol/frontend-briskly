export function computeTotalKilometers(
  connections: ReadonlyArray<{ duration_in_travel: number }>,
): string {
  const totalSeconds = connections.reduce((sum, connection) => sum + connection.duration_in_travel, 0)
  const kilometers = Math.round(totalSeconds / 3600 * 80)
  return `${kilometers} km`
}
