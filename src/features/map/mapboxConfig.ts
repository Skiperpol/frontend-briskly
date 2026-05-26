export function getMapboxAccessToken(): string | undefined {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
  if (!token || token.trim().length === 0) return undefined
  return token.trim()
}
