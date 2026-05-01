"use client"

import { useRef, useState, useCallback } from "react"
import { useMapStore } from "@/store/mapStore"
import { useFeed } from "@/hooks/useFeed"
import { FeedCard } from "./FeedCard"
import { FeedSkeleton } from "./FeedSkeleton"
import { SORT_LABELS } from "@/lib/constants"
import type { SortOption } from "@/types"

interface FeedPanelProps {
  coords: { lat: number; lng: number }
}

const SORTS: SortOption[] = ["nearest", "stalest", "hottest"]

export function FeedPanel({ coords }: FeedPanelProps) {
  const { activeFilters, setSort } = useMapStore()
  const { data, isLoading, isError, refetch } = useFeed(coords)

  // Pull-to-refresh
  const scrollRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)
  const [refreshing, setRefreshing] = useState(false)

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const onTouchEnd = useCallback(
    async (e: React.TouchEvent) => {
      const scrollEl = scrollRef.current
      if (!scrollEl) return
      const delta = e.changedTouches[0].clientY - touchStartY.current
      if (delta > 60 && scrollEl.scrollTop === 0) {
        setRefreshing(true)
        await refetch()
        setRefreshing(false)
      }
    },
    [refetch],
  )

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      {/* Sort tabs */}
      <div
        className="flex px-4 py-3 gap-2 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--color-border)" }}
        role="tablist"
        aria-label="Sort feed by"
      >
        {SORTS.map((sort) => {
          const active = activeFilters.sort === sort
          return (
            <button
              key={sort}
              role="tab"
              aria-selected={active}
              onClick={() => setSort(sort)}
              className="flex-1 py-2 rounded text-xs font-medium transition-colors"
              style={{
                fontFamily: "var(--font-mono)",
                backgroundColor: active ? "rgba(255,76,0,0.08)" : "transparent",
                color: active ? "var(--color-accent)" : "var(--color-text-2)",
                border: active ? "1px solid rgba(255,76,0,0.2)" : "1px solid transparent",
                minHeight: "44px",
                letterSpacing: "0.02em",
              }}
            >
              {SORT_LABELS[sort]}
            </button>
          )
        })}
      </div>

      {/* List */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="tabpanel"
      >
        {refreshing && (
          <div className="py-2 text-center">
            <span style={{ fontSize: "11px", color: "var(--color-text-3)", fontFamily: "var(--font-mono)" }}>
              Refreshing…
            </span>
          </div>
        )}

        {isLoading && <FeedSkeleton />}

        {isError && (
          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
            <AlertIcon />
            <p style={{ fontSize: "13px", color: "var(--color-text-2)" }}>
              Could not load cases near you. Check your connection and try again.
            </p>
            <button
              onClick={() => refetch()}
              className="text-xs px-4 py-2 rounded"
              style={{
                color: "var(--color-accent)",
                border: "1px solid rgba(255,76,0,0.3)",
                fontFamily: "var(--font-mono)",
                minHeight: "44px",
              }}
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && data?.items.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
            <EmptyIcon />
            <p style={{ fontSize: "13px", color: "var(--color-text-2)" }}>
              No open cases found nearby.
            </p>
          </div>
        )}

        {!isLoading && data?.items.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}
      </div>

      {/* Count footer */}
      {data && data.total > 0 && (
        <div
          className="flex-shrink-0 px-4 py-2"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <span
            style={{
              fontSize: "11px",
              color: "var(--color-text-3)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {data.total} open case{data.total !== 1 ? "s" : ""} nearby
          </span>
        </div>
      )}
    </div>
  )
}

function AlertIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-3)" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function EmptyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-3)" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 15s1.5-2 4-2 4 2 4 2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  )
}
