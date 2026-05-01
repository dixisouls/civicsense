"use client"

import { useEffect, useRef, useCallback } from "react"
import { loadMaps } from "@/lib/maps"
import { useMapStore } from "@/store/mapStore"
import { MarkerLayer } from "./MarkerLayer"
import { HeatmapLayer } from "./HeatmapLayer"
import { useMapData } from "@/hooks/useMapData"
import { Spinner } from "@/components/ui/Spinner"

interface MapContainerProps {
  coords: { lat: number; lng: number }
  className?: string
  style?: React.CSSProperties
}

export function MapContainer({ coords, className, style }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const { mapMode, setMapMode, heatmapDateRange, setHeatmapDateRange } = useMapStore()
  const { liveQuery, heatmapQuery } = useMapData(coords)

  const initMap = useCallback(async () => {
    if (!mapRef.current || googleMapRef.current) return

    await loadMaps()

    googleMapRef.current = new google.maps.Map(mapRef.current, {
      center: coords,
      zoom: 14,
      mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID!,
      disableDefaultUI: true,
      gestureHandling: "greedy",
      clickableIcons: false,
      backgroundColor: "#0A0A0A",
      colorScheme: google.maps.ColorScheme.DARK,
    })
  }, [coords])

  useEffect(() => {
    initMap()
  }, [initMap])

  // Sync center from store
  useEffect(() => {
    if (!googleMapRef.current) return
    googleMapRef.current.panTo(coords)
  }, [coords])

  const isLoading =
    mapMode === "live" ? liveQuery.isLoading : heatmapQuery.isLoading

  return (
    <div className={`relative ${className ?? ""}`} style={style}>
      <div ref={mapRef} className="w-full h-full" />

      {/* Mode toggle */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 flex rounded-lg overflow-hidden z-10"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        {(["live", "heatmap"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setMapMode(mode)}
            className="px-4 py-2 text-xs font-medium transition-colors"
            style={{
              fontFamily: "var(--font-mono)",
              color: mapMode === mode ? "var(--color-accent)" : "var(--color-text-2)",
              backgroundColor: mapMode === mode ? "rgba(255,76,0,0.08)" : "transparent",
              minHeight: "44px",
              letterSpacing: "0.04em",
            }}
            aria-pressed={mapMode === mode}
            aria-label={`${mode === "live" ? "Live" : "Heatmap"} map view`}
          >
            {mode === "live" ? "LIVE" : "HEAT"}
          </button>
        ))}
      </div>

      {/* Heatmap date controls */}
      {mapMode === "heatmap" && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-lg px-3 py-2 z-10"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <input
            type="date"
            value={heatmapDateRange.from}
            max={heatmapDateRange.to}
            onChange={(e) =>
              setHeatmapDateRange({ ...heatmapDateRange, from: e.target.value })
            }
            className="bg-transparent outline-none"
            style={{
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-1)",
            }}
            aria-label="Heatmap start date"
          />
          <span style={{ color: "var(--color-text-3)", fontSize: "12px" }}>—</span>
          <input
            type="date"
            value={heatmapDateRange.to}
            min={heatmapDateRange.from}
            onChange={(e) =>
              setHeatmapDateRange({ ...heatmapDateRange, to: e.target.value })
            }
            className="bg-transparent outline-none"
            style={{
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-1)",
            }}
            aria-label="Heatmap end date"
          />
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-3 right-3 z-10">
          <Spinner size="sm" />
        </div>
      )}

      {/* Markers / Heatmap */}
      {googleMapRef.current && mapMode === "live" && liveQuery.data && (
        <MarkerLayer map={googleMapRef.current} markers={liveQuery.data.markers} />
      )}
      {googleMapRef.current && mapMode === "heatmap" && heatmapQuery.data && (
        <HeatmapLayer map={googleMapRef.current} points={heatmapQuery.data.points} />
      )}
    </div>
  )
}
