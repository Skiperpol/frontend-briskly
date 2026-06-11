import { useEffect, useMemo, useRef, useState } from "react"
import type {
  DataDrivenPropertyValueSpecification,
  LineLayerSpecification,
  MapLayerMouseEvent,
} from "mapbox-gl"
import Map, { Layer, NavigationControl, Source, type MapRef } from "react-map-gl/mapbox"

import type { LatLngTuple } from "@/domain/models/GeoPosition"
import { MapboxMissingToken } from "@/features/map/components/MapboxMissingToken"
import {
  applyEuropeView,
  applyPointView,
  applyTripView,
  EUROPE_DEFAULT_VIEW,
  EUROPE_MAX_BOUNDS,
  positionsToBounds,
} from "@/features/map/mapBoundsUtils"
import { buildRoutesGeoJson, buildStopsGeoJson } from "@/features/map/mapGeoJson"
import { getMapboxAccessToken } from "@/features/map/mapboxConfig"
import { getMapStyle, type MapStyleId } from "@/features/map/mapStyles"
import { DIMMED_TRIP_OPACITY } from "@/features/map/tripMapConstants"
import type { TripMapLayer } from "@/features/map/tripMapUtils"

import "mapbox-gl/dist/mapbox-gl.css"

export const MAP_CAMERA_IDLE = "idle"
export const MAP_CAMERA_OVERVIEW = "overview"

const EUROPE_INITIAL_VIEW = {
  longitude: EUROPE_DEFAULT_VIEW.center[0],
  latitude: EUROPE_DEFAULT_VIEW.center[1],
  zoom: EUROPE_DEFAULT_VIEW.zoom,
  pitch: EUROPE_DEFAULT_VIEW.pitch,
  bearing: EUROPE_DEFAULT_VIEW.bearing,
}

type GlobalMapProps = {
  layers: TripMapLayer[]
  focusPositions: LatLngTuple[]
  focusKey: string
  mapStyleId: MapStyleId
  pointFocusZoom?: number
  selectedStopId?: string | null
  hoveredStopId?: string | null
  onStopSelect?: (stopId: string) => void
  onStopHover?: (stopId: string | null) => void
  selectableStopIds?: string[]
  highlightedTripId?: string | null
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
  highlightedTripId = null,
}: GlobalMapProps) {
  const selectableSet = useMemo(
    () => (selectableStopIds ? new Set(selectableStopIds) : null),
    [selectableStopIds],
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapRef>(null)
  const lastCameraKeyRef = useRef<string | null>(null)
  const hasAppliedCameraRef = useRef(false)
  const [mapReady, setMapReady] = useState(false)
  const [pulsePhase, setPulsePhase] = useState(0)

  const activeStopId = hoveredStopId ?? selectedStopId ?? ""
  const pulseBoost = activeStopId ? 2 + Math.sin(pulsePhase) * 2 : 0
  const pulseRingBoost = activeStopId ? 4 + Math.sin(pulsePhase) * 3 : 0
  const token = getMapboxAccessToken()
  const maxZoom =
    focusKey === MAP_CAMERA_OVERVIEW || focusKey === MAP_CAMERA_IDLE ? 5 : 14
  const mapStyle = getMapStyle(mapStyleId)

  const routesGeoJson = useMemo(() => buildRoutesGeoJson(layers), [layers])
  const stopsGeoJson = useMemo(() => buildStopsGeoJson(layers), [layers])

  const routeLinePaint = useMemo((): LineLayerSpecification["paint"] => {
    const activeOpacity = (dashed: boolean) => (dashed ? 0.75 : 0.92)
    const dimmedOpacity = (dashed: boolean) => activeOpacity(dashed) * DIMMED_TRIP_OPACITY

    if (!highlightedTripId) {
      return {
        "line-color": ["get", "color"],
        "line-width": ["case", ["==", ["get", "dashed"], true], 4, 5],
        "line-opacity": [
          "case",
          ["==", ["get", "dashed"], true],
          activeOpacity(true),
          activeOpacity(false),
        ],
        "line-dasharray": [
          "case",
          ["==", ["get", "dashed"], true],
          ["literal", [2, 2]],
          ["literal", [1, 0]],
        ],
        "line-opacity-transition": { duration: 250, delay: 0 },
      }
    }

    return {
      "line-color": ["get", "color"],
      "line-width": ["case", ["==", ["get", "dashed"], true], 4, 5],
      "line-opacity": [
        "case",
        ["==", ["get", "tripId"], highlightedTripId],
        ["case", ["==", ["get", "dashed"], true], activeOpacity(true), activeOpacity(false)],
        ["case", ["==", ["get", "dashed"], true], dimmedOpacity(true), dimmedOpacity(false)],
      ],
      "line-dasharray": [
        "case",
        ["==", ["get", "dashed"], true],
        ["literal", [2, 2]],
        ["literal", [1, 0]],
      ],
      "line-opacity-transition": { duration: 250, delay: 0 },
    }
  }, [highlightedTripId])

  const stopMarkerOpacity = useMemo((): DataDrivenPropertyValueSpecification<number> => {
    if (!highlightedTripId) return 1

    return [
      "case",
      ["==", ["get", "tripId"], highlightedTripId],
      1,
      DIMMED_TRIP_OPACITY,
    ]
  }, [highlightedTripId])
  const focusPositionsKey = useMemo(
    () =>
      focusKey === MAP_CAMERA_OVERVIEW || focusKey === MAP_CAMERA_IDLE
        ? focusKey
        : focusPositions
            .map(([lat, lng]) => `${lat.toFixed(5)},${lng.toFixed(5)}`)
            .join("|"),
    [focusKey, focusPositions],
  )

  useEffect(() => {
    if (!mapReady) return

    const map = mapRef.current?.getMap()
    if (!map) return

    if (focusKey === MAP_CAMERA_IDLE) {
      if (lastCameraKeyRef.current !== MAP_CAMERA_IDLE) {
        lastCameraKeyRef.current = MAP_CAMERA_IDLE
      }
      return
    }

    const cameraKey =
      focusKey === MAP_CAMERA_OVERVIEW
        ? MAP_CAMERA_OVERVIEW
        : `${focusKey}::${focusPositionsKey}::${pointFocusZoom ?? ""}`

    if (lastCameraKeyRef.current === cameraKey) return
    lastCameraKeyRef.current = cameraKey

    const animate = hasAppliedCameraRef.current
    hasAppliedCameraRef.current = true

    if (focusKey === MAP_CAMERA_OVERVIEW) {
      applyEuropeView(map, animate)
      return
    }

    if (focusPositions.length === 0) return

    if (focusPositions.length === 1) {
      applyPointView(map, focusPositions[0], pointFocusZoom, animate)
      return
    }

    const bounds = positionsToBounds(focusPositions)
    if (bounds) {
      applyTripView(map, bounds, maxZoom, animate)
    }
  }, [mapReady, focusKey, focusPositions, focusPositionsKey, maxZoom, pointFocusZoom])

  useEffect(() => {
    if (!mapReady) return

    const map = mapRef.current?.getMap()
    const container = containerRef.current
    if (!map || !container) return

    let frameId = 0
    const scheduleResize = () => {
      cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(() => map.resize())
    }

    scheduleResize()

    const resizeObserver = new ResizeObserver(scheduleResize)
    resizeObserver.observe(container)
    window.addEventListener("resize", scheduleResize)

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      window.removeEventListener("resize", scheduleResize)
    }
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
    <div ref={containerRef} className="h-full w-full">
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
        setMapReady(true)
      }}
    >
      <NavigationControl position="top-left" showCompass={false} />

      <Source id="bus-routes" type="geojson" data={routesGeoJson}>
        <Layer
          id="bus-routes-line"
          type="line"
          paint={routeLinePaint}
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
            "circle-opacity": stopMarkerOpacity,
            "circle-opacity-transition": { duration: 250, delay: 0 },
          }}
        />
      </Source>
    </Map>
    </div>
  )
}
