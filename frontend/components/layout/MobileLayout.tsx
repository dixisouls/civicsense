"use client"

import type { ReactNode } from "react"
import { BottomSheet } from "./BottomSheet"
import { BottomNav } from "@/components/ui/BottomNav"

interface MobileLayoutProps {
  map: ReactNode
  feed: ReactNode
  searchBar: ReactNode
}

export function MobileLayout({ map, feed, searchBar }: MobileLayoutProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        overflow: "hidden",
        backgroundColor: "var(--color-bg)",
      }}
    >
      {/* Full-screen map */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {map}
      </div>

      {/* Search bar — floating top */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          right: 12,
          zIndex: 20,
        }}
      >
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            border: "1px solid var(--color-border)",
            overflow: "hidden",
          }}
        >
          {searchBar}
        </div>
      </div>

      {/* Bottom sheet */}
      <BottomSheet>
        {feed}
      </BottomSheet>

      {/* Bottom nav */}
      <BottomNav />
    </div>
  )
}
