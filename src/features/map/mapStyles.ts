export type MapStyleId = "satellite" | "standard" | "terrain" | "dark"

export type MapStyleLayer = {
  url: string
  attribution: string
  opacity?: number
  maxNativeZoom?: number
}

export type MapStyleDefinition = {
  id: MapStyleId
  label: string
  background: string
  layers: MapStyleLayer[]
}

export const MAP_STYLES: MapStyleDefinition[] = [
  {
    id: "satellite",
    label: "Satelita",
    background: "#0b1a2e",
    layers: [
      {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution:
          'Tiles &copy; <a href="https://www.esri.com/">Esri</a> — Earthstar Geographics',
        maxNativeZoom: 19,
      },
      {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        attribution: "Labels &copy; Esri",
        opacity: 0.85,
      },
    ],
  },
  {
    id: "standard",
    label: "Standardowa",
    background: "#aad3df",
    layers: [
      {
        url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxNativeZoom: 20,
      },
    ],
  },
  {
    id: "terrain",
    label: "Teren",
    background: "#e8e4d9",
    layers: [
      {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        attribution:
          'Tiles &copy; <a href="https://www.esri.com/">Esri</a> — USGS, NOAA',
        maxNativeZoom: 19,
      },
    ],
  },
  {
    id: "dark",
    label: "Ciemna",
    background: "#1a1a1a",
    layers: [
      {
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxNativeZoom: 20,
      },
    ],
  },
]

export const DEFAULT_MAP_STYLE_ID: MapStyleId = "satellite"

export function getMapStyle(id: MapStyleId): MapStyleDefinition {
  return MAP_STYLES.find((style) => style.id === id) ?? MAP_STYLES[0]
}
