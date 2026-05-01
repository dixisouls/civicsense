"use client"

import { useRef, useState, useCallback } from "react"
import { useMapStore } from "@/store/mapStore"
import { useFeed } from "@/hooks/useFeed"
import { FeedCard } from "./FeedCard"
import { FeedSkeleton } from "./FeedSkeleton"
import { SORT_LABELS, SF_NEIGHBORHOODS } from "@/lib/constants"
import { NeighborhoodSummary } from "@/components/summary/NeighborhoodSummary"
import type { SortOption } from "@/types"

interface FeedPanelProps {
  coords: { lat: number; lng: number }
}

const SORTS: SortOption[] = ["nearest", "stalest", "hottest"]

export function FeedPanel({ coords }: FeedPanelProps) {
  const { activeFilters, setSort, selectedNeighbourhood, setSelectedNeighbourhood } = useMapStore()
  const { data, isLoading, isError, refetch } = useFeed(coords)
  const [neighbourhoodOpen, setNeighbourhoodOpen] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)
  const [refreshing, setRefreshing] = useState(false)

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const onTouchEnd = useCallback(async (e: React.TouchEvent) => {
    const el = scrollRef.current
    if (!el) return
    const delta = e.changedTouches[0].clientY - touchStartY.current
    if (delta > 60 && el.scrollTop === 0) {
      setRefreshing(true)
      await refetch()
      setRefreshing(false)
    }
  }, [refetch])

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Sort tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "12px 16px 10px",
          borderBottom: "1px solid var(--color-border)",
          flexShrink: 0,
        }}
        role="tablist"
        aria-label="Sort feed"
      >
        {SORTS.map((sort) => {
          const active = activeFilters.sort === sort
          return (
            <button
              key={sort}
              role="tab"
              aria-selected={active}
              onClick={() => setSort(sort)}
              style={{
                flex: 1,
                padding: "7px 4px",
                borderRadius: 8,
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                fontWeight: active ? 600 : 400,
                letterSpacing: "0.02em",
                border: active ? "1px solid rgba(201,56,0,0.25)" : "1px solid transparent",
                backgroundColor: active ? "rgba(201,56,0,0.07)" : "transparent",
                color: active ? "var(--color-accent)" : "var(--color-text-2)",
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {SORT_LABELS[sort]}
            </button>
          )
        })}
      </div>

      {/* Neighbourhood selector */}
      <div
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid var(--color-border)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setNeighbourhoodOpen((o) => !o)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "9px 12px",
            borderRadius: 10,
            border: "1px solid var(--color-border)",
            backgroundColor: selectedNeighbourhood ? "rgba(201,56,0,0.05)" : "var(--color-surface-2)",
            cursor: "pointer",
            fontSize: "13px",
            fontFamily: "var(--font-sans)",
            color: selectedNeighbourhood ? "var(--color-accent)" : "var(--color-text-2)",
          }}
          aria-label="Select neighbourhood for AI summary"
          aria-expanded={neighbourhoodOpen}
        >
          <span>{selectedNeighbourhood ?? "AI neighbourhood summary…"}</span>
          <ChevronIcon open={neighbourhoodOpen} />
        </button>

        {/* Dropdown */}
        {neighbourhoodOpen && (
          <div
            style={{
              marginTop: 6,
              border: "1px solid var(--color-border)",
              borderRadius: 10,
              backgroundColor: "var(--color-surface)",
              maxHeight: 200,
              overflowY: "auto",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            }}
          >
            <button
              onClick={() => { setSelectedNeighbourhood(null); setNeighbourhoodOpen(false) }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 14px",
                fontSize: "13px",
                fontFamily: "var(--font-sans)",
                color: "var(--color-text-3)",
                borderBottom: "1px solid var(--color-border)",
                backgroundColor: "transparent",
                cursor: "pointer",
              }}
            >
              — Clear selection
            </button>
            {SF_NEIGHBORHOODS.map((n) => (
              <button
                key={n}
                onClick={() => { setSelectedNeighbourhood(n); setNeighbourhoodOpen(false) }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontFamily: "var(--font-sans)",
                  color: selectedNeighbourhood === n ? "var(--color-accent)" : "var(--color-text-1)",
                  backgroundColor: selectedNeighbourhood === n ? "rgba(201,56,0,0.05)" : "transparent",
                  borderBottom: "1px solid var(--color-border)",
                  cursor: "pointer",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        )}

        {/* Summary */}
        {selectedNeighbourhood && !neighbourhoodOpen && (
          <div style={{ marginTop: 10 }}>
            <NeighborhoodSummary neighbourhood={selectedNeighbourhood} />
          </div>
        )}
      </div>

      {/* Feed list */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="tabpanel"
      >
        {refreshing && (
          <div style={{ padding: "8px 0", textAlign: "center" }}>
            <span style={{ fontSize: "11px", color: "var(--color-text-3)", fontFamily: "var(--font-mono)" }}>
              Refreshing…
            </span>
          </div>
        )}

        {isLoading && <FeedSkeleton />}

        {isError && (
          <div style={{ padding: "40px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <p style={{ fontSize: "13px", color: "var(--color-text-2)" }}>
              Couldn't load nearby cases.
            </p>
            <button
              onClick={() => refetch()}
              style={{
                fontSize: "12px",
                padding: "8px 16px",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                color: "var(--color-accent)",
                fontFamily: "var(--font-mono)",
                backgroundColor: "transparent",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && data?.items.length === 0 && (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "var(--color-text-2)" }}>No open cases nearby.</p>
          </div>
        )}

        {!isLoading && data?.items.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}

        {data && data.total > 0 && (
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--color-border)" }}>
            <span style={{ fontSize: "11px", color: "var(--color-text-3)", fontFamily: "var(--font-mono)" }}>
              {data.total} open case{data.total !== 1 ? "s" : ""} nearby
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
