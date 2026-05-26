export type MapStyleId = "satellite" | "standard" | "terrain" | "dark"

export type MapStyleDefinition = {
  id: MapStyleId
  label: string
  mapboxStyle: string
}

export const MAP_STYLES: MapStyleDefinition[] = [
  {
    id: "standard",
    label: "Standardowa",
    mapboxStyle: "mapbox://styles/mapbox/streets-v12",
  },
  {
    id: "satellite",
    label: "Satelita",
    mapboxStyle: "mapbox://styles/mapbox/satellite-streets-v12",
  },
  {
    id: "terrain",
    label: "Teren",
    mapboxStyle: "mapbox://styles/mapbox/outdoors-v12",
  },
  {
    id: "dark",
    label: "Ciemna",
    mapboxStyle: "mapbox://styles/mapbox/dark-v11",
  },
]

export const DEFAULT_MAP_STYLE_ID: MapStyleId = "standard"

export function getMapStyle(id: MapStyleId): MapStyleDefinition {
  return MAP_STYLES.find((style) => style.id === id) ?? MAP_STYLES[0]
}
