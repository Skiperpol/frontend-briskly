export type GeoPosition = {
  lat: number
  lng: number
}

export type LatLngTuple = [number, number]

export function toLatLngTuple(position: GeoPosition): LatLngTuple {
  return [position.lat, position.lng]
}
