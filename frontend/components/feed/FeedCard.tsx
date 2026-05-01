"use client"

import { useMapStore } from "@/store/mapStore"
import { getCategoryColor } from "@/lib/constants"
import { CategoryBadge, SeverityBadge, SourceBadge } from "@/components/ui/Badge"
import type { FeedItem } from "@/types"

interface FeedCardProps {
  item: FeedItem
}

export function FeedCard({ item }: FeedCardProps) {
  const { selectedMarkerId, setSelectedMarkerId, setCenter } = useMapStore()
  const isActive = selectedMarkerId === item.id
  const categoryColor = getCategoryColor(item.category)

  const handleClick = () => {
    setSelectedMarkerId(item.id)
    // Other effects (map pan) handled by MapContainer listening to selectedMarkerId
  }

  return (
    <button
      onClick={handleClick}
      className="w-full text-left flex items-start gap-3 px-4 py-4 transition-colors"
      style={{
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: isActive ? "rgba(255,76,0,0.04)" : "transparent",
        borderLeft: isActive ? `2px solid var(--color-accent)` : "2px solid transparent",
        minHeight: "44px",
      }}
      aria-pressed={isActive}
      aria-label={`${item.category ?? "Issue"} at ${item.address ?? "unknown location"}, open for ${item.days_open} days`}
    >
      {/* Category dot */}
      <span
        className="flex-shrink-0 rounded-full"
        style={{
          width: "8px",
          height: "8px",
          backgroundColor: categoryColor,
          marginTop: "6px",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <span
          className="text-sm font-medium truncate"
          style={{ color: "var(--color-text-1)", fontFamily: "var(--font-mono)" }}
        >
          {item.category ?? "Other"}
        </span>

        {item.address && (
          <span
            className="text-xs truncate"
            style={{ color: "var(--color-text-2)" }}
          >
            {item.address}
          </span>
        )}

        <div className="flex flex-wrap gap-1.5 mt-0.5">
          <SourceBadge source={item.source} />
          {item.source === "user" && item.severity && (
            <SeverityBadge severity={item.severity} />
          )}
        </div>
      </div>

      {/* Days open */}
      <span
        className="flex-shrink-0 text-xs"
        style={{ color: "var(--color-text-3)", fontFamily: "var(--font-mono)" }}
        aria-label={`${item.days_open} days open`}
      >
        {item.days_open}d
      </span>
    </button>
  )
}
