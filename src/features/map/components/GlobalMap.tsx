import { useEffect, useMemo, useRef, useState } from "react"
import type { MapLayerMouseEvent } from "mapbox-gl"
import Map, { Layer, NavigationControl, Source, type MapRef } from "react-map-gl/mapbox"

import type { LatLngTuple } from "@/domain/models/GeoPosition"
import { MapboxMissingToken } from "@/features/map/components/MapboxMissingToken"
import {
  applyEuropeView,
  applyPointView,
  applyTripView,
  EUROPE_MAX_BOUNDS,
  positionsToBounds,
} from "@/features/map/mapBoundsUtils"
import { buildRoutesGeoJson, buildStopsGeoJson } from "@/features/map/mapGeoJson"
import { getMapboxAccessToken } from "@/features/map/mapboxConfig"
import { getMapStyle, type MapStyleId } from "@/features/map/mapStyles"
import type { TripMapLayer } from "@/features/map/tripMapUtils"

import "mapbox-gl/dist/mapbox-gl.css"

const EUROPE_INITIAL_VIEW = {
  longitude: 15,
  latitude: 52,
  zoom: 3.8,
  pitch: 0,
  bearing: 0,
}

type GlobalMapProps = {
  layers: TripMapLayer[]
  focusPositions: LatLngTuple[]
  focusKey: string
  mapStyleId: MapStyleId
  /** Przy jednym punkcie w focusPositions — flyTo zamiast fitBounds. */
  pointFocusZoom?: number
  /** Kliknięcie w marker przystanku (wymaga stopId w GeoJSON). */
  selectedStopId?: string | null
  hoveredStopId?: string | null
  onStopSelect?: (stopId: string) => void
  onStopHover?: (stopId: string | null) => void
  /** Jeśli podane — tylko te markery reagują na klik/hover (np. bez punktów trasy). */
  selectableStopIds?: string[]
}

const STOPS_LAYER_ID = "bus-stops-circle"

export function GlobalMap({
  layers,
  focusPositions,
  focusKey,
  mapStyleId,
  pointFocusZoom = 13,
  selectedStopId = null,
  hoveredStopId = null,
  onStopSelect,
  onStopHover,
  selectableStopIds,
}: GlobalMapProps) {
  const selectableSet = useMemo(
    () => (selectableStopIds ? new Set(selectableStopIds) : null),
    [selectableStopIds],
  )
  const mapRef = useRef<MapRef>(null)
  const [mapReady, setMapReady] = useState(false)
  const [pulsePhase, setPulsePhase] = useState(0)

  const activeStopId = hoveredStopId ?? selectedStopId ?? ""
  const pulseBoost = activeStopId ? 2 + Math.sin(pulsePhase) * 2 : 0
  const pulseRingBoost = activeStopId ? 4 + Math.sin(pulsePhase) * 3 : 0
  const token = getMapboxAccessToken()
  const maxZoom = focusKey === "all" ? 5 : 14
  const mapStyle = getMapStyle(mapStyleId)

  const routesGeoJson = useMemo(() => buildRoutesGeoJson(layers), [layers])
  const stopsGeoJson = useMemo(() => buildStopsGeoJson(layers), [layers])

  useEffect(() => {
    if (!mapReady) return

    const map = mapRef.current?.getMap()
    if (!map) return

    if (focusKey === "all") {
      applyEuropeView(map)
      return
    }

    if (focusPositions.length === 0) return

    if (focusPositions.length === 1) {
      applyPointView(map, focusPositions[0], pointFocusZoom)
      return
    }

    const bounds = positionsToBounds(focusPositions)
    if (bounds) {
      applyTripView(map, bounds, maxZoom)
    }
  }, [mapReady, focusKey, focusPositions, maxZoom, pointFocusZoom])

  useEffect(() => {
    if (!mapReady) return

    const map = mapRef.current?.getMap()
    if (!map) return

    const onResize = () => map.resize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [mapReady])

  useEffect(() => {
    if (!activeStopId) return

    let frameId = 0
    const tick = () => {
      setPulsePhase(performance.now() / 320)
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [activeStopId])

  useEffect(() => {
    if (!mapReady || (!onStopSelect && !onStopHover)) return

    const map = mapRef.current?.getMap()
    if (!map) return

    const handleClick = (event: MapLayerMouseEvent) => {
      const stopId = event.features?.[0]?.properties?.stopId
      if (typeof stopId !== "string" || stopId.length === 0) return
      if (selectableSet && !selectableSet.has(stopId)) return
      onStopSelect?.(stopId)
    }

    const handleMove = (event: MapLayerMouseEvent) => {
      const stopId = event.features?.[0]?.properties?.stopId
      if (typeof stopId !== "string" || stopId.length === 0) return
      if (selectableSet && !selectableSet.has(stopId)) return
      map.getCanvas().style.cursor = "pointer"
      onStopHover?.(stopId)
    }

    const handleLeave = () => {
      map.getCanvas().style.cursor = ""
      onStopHover?.(null)
    }

    if (onStopSelect) {
      map.on("click", STOPS_LAYER_ID, handleClick)
    }
    map.on("mousemove", STOPS_LAYER_ID, handleMove)
    map.on("mouseleave", STOPS_LAYER_ID, handleLeave)

    return () => {
      if (onStopSelect) {
        map.off("click", STOPS_LAYER_ID, handleClick)
      }
      map.off("mousemove", STOPS_LAYER_ID, handleMove)
      map.off("mouseleave", STOPS_LAYER_ID, handleLeave)
      map.getCanvas().style.cursor = ""
    }
  }, [mapReady, onStopHover, onStopSelect, selectableSet])

  if (!token) {
    return <MapboxMissingToken />
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={token}
      mapStyle={mapStyle.mapboxStyle}
      initialViewState={EUROPE_INITIAL_VIEW}
      maxBounds={EUROPE_MAX_BOUNDS}
      projection="mercator"
      minPitch={0}
      maxPitch={0}
      style={{ width: "100%", height: "100%" }}
      attributionControl
      renderWorldCopies={false}
      onLoad={() => {
        const map = mapRef.current?.getMap()
        map?.setProjection("mercator")
        map?.setPitch(0)
        map?.setBearing(0)
        map?.resize()
        setMapReady(true)
      }}
    >
      <NavigationControl position="top-left" showCompass={false} />

      <Source id="bus-routes" type="geojson" data={routesGeoJson}>
        <Layer
          id="bus-routes-line"
          type="line"
          paint={{
            "line-color": ["get", "color"],
            "line-width": [
              "case",
              ["==", ["get", "dashed"], true],
              4,
              5,
            ],
            "line-opacity": [
              "case",
              ["==", ["get", "dashed"], true],
              0.75,
              0.92,
            ],
            "line-dasharray": [
              "case",
              ["==", ["get", "dashed"], true],
              ["literal", [2, 2]],
              ["literal", [1, 0]],
            ],
          }}
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
        />
      </Source>

      <Source id="bus-stops" type="geojson" data={stopsGeoJson}>
        <Layer
          id="bus-stops-pulse"
          type="circle"
          paint={{
            "circle-radius": [
              "case",
              ["==", ["get", "stopId"], activeStopId],
              10 + pulseRingBoost,
              0,
            ],
            "circle-color": ["get", "color"],
            "circle-opacity": [
              "case",
              ["==", ["get", "stopId"], activeStopId],
              0.25,
              0,
            ],
            "circle-stroke-width": 0,
          }}
        />
        <Layer
          id={STOPS_LAYER_ID}
          type="circle"
          paint={{
            "circle-radius": [
              "case",
              ["==", ["get", "stopId"], activeStopId],
              9 + pulseBoost,
              8,
            ],
            "circle-color": ["get", "color"],
            "circle-stroke-width": [
              "case",
              ["==", ["get", "stopId"], activeStopId],
              3,
              2,
            ],
            "circle-stroke-color": "#ffffff",
          }}
        />
      </Source>
    </Map>
  )
}
