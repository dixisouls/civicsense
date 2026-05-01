"use client"

import { useEffect, useState } from "react"
import { useMapStore } from "@/store/mapStore"
import { useLocation } from "@/hooks/useLocation"
import { MapContainer } from "@/components/map/MapContainer"
import { FeedPanel } from "@/components/feed/FeedPanel"
import { SearchBar } from "@/components/ui/SearchBar"
import { NeighborhoodSummary } from "@/components/summary/NeighborhoodSummary"
import { MobileLayout } from "@/components/layout/MobileLayout"
import { DesktopLayout } from "@/components/layout/DesktopLayout"
import { SF_NEIGHBORHOODS } from "@/lib/constants"

export default function HomePage() {
  const { coords, usingFallback, detect } = useLocation()
  const { setCenter, selectedNeighbourhood, setSelectedNeighbourhood } = useMapStore()
  const [showFallbackToast, setShowFallbackToast] = useState(false)

  useEffect(() => {
    detect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (usingFallback) {
      setShowFallbackToast(true)
      const t = setTimeout(() => setShowFallbackToast(false), 4000)
      return () => clearTimeout(t)
    }
  }, [usingFallback])

  useEffect(() => {
    setCenter(coords)
  }, [coords, setCenter])

  const handlePlaceSelect = ({ lat, lng }: { lat: number; lng: number; address: string }) => {
    setCenter({ lat, lng })
  }

  const map = <MapContainer coords={coords} className="w-full h-full" />
  const searchBar = <SearchBar onPlaceSelect={handlePlaceSelect} />
  const feed = <FeedPanel coords={coords} />

  // Desktop-only neighbourhood selector
  const neighbourhoodSelector = (
    <select
      value={selectedNeighbourhood ?? ""}
      onChange={(e) => setSelectedNeighbourhood(e.target.value || null)}
      className="w-full rounded-lg px-3 py-2.5 outline-none appearance-none"
      style={{
        backgroundColor: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
        color: selectedNeighbourhood ? "var(--color-text-1)" : "var(--color-text-2)",
        fontSize: "13px",
        fontFamily: "var(--font-sans)",
        cursor: "pointer",
      }}
      aria-label="Select neighborhood for AI summary"
    >
      <option value="">AI neighbourhood summary…</option>
      {SF_NEIGHBORHOODS.map((n) => (
        <option key={n} value={n}>{n}</option>
      ))}
    </select>
  )

  const neighbourhoodPanel = selectedNeighbourhood ? (
    <NeighborhoodSummary neighbourhood={selectedNeighbourhood} />
  ) : undefined

  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden">
        <MobileLayout
          map={map}
          feed={feed}
          searchBar={searchBar}
        />
      </div>

      {/* Desktop */}
      <DesktopLayout
        map={map}
        feed={feed}
        searchBar={searchBar}
        neighbourhoodSelector={neighbourhoodSelector}
        neighbourhoodPanel={neighbourhoodPanel}
      />

      {/* Location fallback toast */}
      {showFallbackToast && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            borderRadius: 10,
            padding: "10px 16px",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            maxWidth: "calc(100vw - 32px)",
            whiteSpace: "nowrap",
          }}
          role="status"
          aria-live="polite"
        >
          <p style={{ fontSize: "12px", color: "var(--color-text-2)", fontFamily: "var(--font-mono)" }}>
            Using SF city centre — enable location for nearby cases.
          </p>
        </div>
      )}
    </>
  )
}
