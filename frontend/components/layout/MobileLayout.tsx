"use client"

import type { ReactNode } from "react"
import { BottomNav } from "@/components/ui/BottomNav"

interface MobileLayoutProps {
  map: ReactNode
  feed: ReactNode
  searchBar: ReactNode
  neighbourhoodPanel?: ReactNode
}

export function MobileLayout({ map, feed, searchBar, neighbourhoodPanel }: MobileLayoutProps) {
  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Map section — 55vh */}
      <div className="relative flex-shrink-0" style={{ height: "55vh" }}>
        {map}
        {/* Search bar overlay */}
        <div
          className="absolute top-3 left-3 right-3 z-10"
          style={{ maxWidth: "calc(100% - 80px)" }}
        >
          {searchBar}
        </div>
      </div>

      {/* Feed section — remaining space */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        {neighbourhoodPanel && (
          <div
            className="px-4 pt-3 flex-shrink-0"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            {neighbourhoodPanel}
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          {feed}
        </div>
      </div>

      {/* Bottom nav */}
      <BottomNav />
    </div>
  )
}
