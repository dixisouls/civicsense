"use client"

import { useEffect, useRef, useCallback, useState } from "react"
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
  const { center, mapMode, heatmapDateRange, setHeatmapDateRange } = useMapStore()
  const { liveQuery, heatmapQuery } = useMapData(coords)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [draftFrom, setDraftFrom] = useState(heatmapDateRange.from)
  const [draftTo, setDraftTo] = useState(heatmapDateRange.to)

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
      backgroundColor: "#F5F1EB",
      colorScheme: google.maps.ColorScheme.LIGHT,
    })
  }, [coords])

  useEffect(() => {
    initMap()
  }, [initMap])

  useEffect(() => {
    if (!googleMapRef.current) return
    googleMapRef.current.panTo(center)
  }, [center])

  const openDatePicker = () => {
    setDraftFrom(heatmapDateRange.from)
    setDraftTo(heatmapDateRange.to)
    setDatePickerOpen(true)
  }

  const applyDateRange = () => {
    setHeatmapDateRange({ from: draftFrom, to: draftTo })
    setDatePickerOpen(false)
  }

  const resetDateRange = () => {
    const to = new Date().toISOString().split("T")[0]
    const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    setDraftFrom(from)
    setDraftTo(to)
    setHeatmapDateRange({ from, to })
    setDatePickerOpen(false)
  }

  const isLoading = mapMode === "live" ? liveQuery.isLoading : heatmapQuery.isLoading

  const formatDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  return (
    <div className={`relative ${className ?? ""}`} style={style}>
      <div ref={mapRef} className="w-full h-full" />


      {/* Heatmap date button */}
      {mapMode === "heatmap" && !datePickerOpen && (
        <button
          onClick={openDatePicker}
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 24,
            padding: "8px 14px",
            fontSize: "12px",
            fontFamily: "var(--font-mono)",
            color: "var(--color-text-2)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            cursor: "pointer",
            zIndex: 10,
            whiteSpace: "nowrap",
          }}
          aria-label="Set heatmap date range"
        >
          <CalendarIcon />
          {formatDate(heatmapDateRange.from)} — {formatDate(heatmapDateRange.to)}
        </button>
      )}

      {/* Date picker modal */}
      {datePickerOpen && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            display: "flex",
            alignItems: "flex-end",
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setDatePickerOpen(false) }}
        >
          <div
            style={{
              width: "100%",
              backgroundColor: "var(--color-surface)",
              borderRadius: "20px 20px 0 0",
              padding: "24px 20px 32px",
              boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ fontSize: "14px", fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--color-text-1)", marginBottom: 20 }}>
              Heatmap Date Filter
            </p>

            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--color-text-3)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={draftFrom}
                  max={draftTo}
                  onChange={(e) => setDraftFrom(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: "14px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-text-1)",
                    backgroundColor: "var(--color-surface-2)",
                    outline: "none",
                    width: "100%",
                  }}
                  aria-label="Heatmap start date"
                />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--color-text-3)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={draftTo}
                  min={draftFrom}
                  onChange={(e) => setDraftTo(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: "14px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-text-1)",
                    backgroundColor: "var(--color-surface-2)",
                    outline: "none",
                    width: "100%",
                  }}
                  aria-label="Heatmap end date"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={resetDateRange}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 10,
                  border: "1px solid var(--color-border)",
                  fontSize: "13px",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 500,
                  color: "var(--color-text-2)",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
              <button
                onClick={applyDateRange}
                style={{
                  flex: 2,
                  padding: "12px",
                  borderRadius: 10,
                  border: "none",
                  fontSize: "13px",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  backgroundColor: "var(--color-accent)",
                  cursor: "pointer",
                }}
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div style={{ position: "absolute", top: 12, left: 12, zIndex: 10 }}>
          <Spinner size="sm" />
        </div>
      )}

      {googleMapRef.current && mapMode === "live" && liveQuery.data && (
        <MarkerLayer map={googleMapRef.current} markers={liveQuery.data.markers} />
      )}
      {googleMapRef.current && mapMode === "heatmap" && heatmapQuery.data && (
        <HeatmapLayer map={googleMapRef.current} points={heatmapQuery.data.points} />
      )}
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
