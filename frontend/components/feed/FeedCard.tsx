"use client"

import { useMapStore } from "@/store/mapStore"
import { getCategoryColor } from "@/lib/constants"
import { SeverityBadge, SourceBadge } from "@/components/ui/Badge"
import type { FeedItem } from "@/types"

interface FeedCardProps {
  item: FeedItem
}

export function FeedCard({ item }: FeedCardProps) {
  const { selectedMarkerId, setSelectedMarkerId } = useMapStore()
  const isActive = selectedMarkerId === item.id
  const color = getCategoryColor(item.category)

  return (
    <button
      onClick={() => setSelectedMarkerId(item.id)}
      className="w-full text-left"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 16px",
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: isActive ? `${color}08` : "transparent",
        borderLeft: isActive ? `3px solid ${color}` : "3px solid transparent",
        transition: "background-color 0.15s",
        minHeight: 44,
      }}
      aria-pressed={isActive}
      aria-label={`${item.category ?? "Issue"} at ${item.address ?? "unknown location"}`}
    >
      {/* Color bar */}
      <span
        style={{
          flexShrink: 0,
          width: 3,
          height: 36,
          borderRadius: 2,
          backgroundColor: color,
          marginTop: 2,
          opacity: 0.7,
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--color-text-1)",
              fontFamily: "var(--font-sans)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.category ?? "Other"}
          </span>
          <span
            style={{
              fontSize: "11px",
              color: item.days_open > 90 ? "var(--color-danger)" : "var(--color-text-3)",
              fontFamily: "var(--font-mono)",
              flexShrink: 0,
              fontWeight: item.days_open > 90 ? 600 : 400,
            }}
          >
            {item.days_open}d
          </span>
        </div>

        {item.address && (
          <span
            style={{
              fontSize: "12px",
              color: "var(--color-text-2)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.address}
          </span>
        )}

        <div style={{ display: "flex", gap: 6, marginTop: 2, flexWrap: "wrap" }}>
          <SourceBadge source={item.source} />
          {item.source === "user" && item.severity && (
            <SeverityBadge severity={item.severity} />
          )}
        </div>
      </div>
    </button>
  )
}
