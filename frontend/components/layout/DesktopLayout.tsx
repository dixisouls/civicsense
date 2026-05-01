"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserMenu } from "@/components/auth/UserMenu"
import { useAuth } from "@/hooks/useAuth"
import { useState } from "react"
import { SignInModal } from "@/components/auth/SignInModal"

interface DesktopLayoutProps {
  map: ReactNode
  feed: ReactNode
  searchBar: ReactNode
  neighbourhoodSelector: ReactNode
  neighbourhoodPanel?: ReactNode
}

export function DesktopLayout({
  map,
  feed,
  searchBar,
  neighbourhoodSelector,
  neighbourhoodPanel,
}: DesktopLayoutProps) {
  const { user } = useAuth()
  const [signInOpen, setSignInOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="hidden lg:flex h-screen overflow-hidden" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col flex-shrink-0 overflow-hidden"
        style={{
          width: "400px",
          borderRight: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        {/* Sidebar header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <span
            className="text-sm font-medium tracking-widest"
            style={{ color: "var(--color-text-1)", fontFamily: "var(--font-mono)" }}
          >
            CIVIC SENSE
          </span>

          <div className="flex items-center gap-3">
            <Link
              href="/report"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-opacity"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                fontFamily: "var(--font-mono)",
                minHeight: "32px",
              }}
            >
              + Report
            </Link>

            {user ? (
              <UserMenu />
            ) : (
              <button
                onClick={() => setSignInOpen(true)}
                className="text-xs"
                style={{
                  color: "var(--color-text-2)",
                  fontFamily: "var(--font-mono)",
                  minHeight: "32px",
                }}
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--color-border)" }}>
          {searchBar}
        </div>

        {/* Neighbourhood selector */}
        <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--color-border)" }}>
          {neighbourhoodSelector}
        </div>

        {/* Neighbourhood summary */}
        {neighbourhoodPanel && (
          <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--color-border)" }}>
            {neighbourhoodPanel}
          </div>
        )}

        {/* Feed */}
        <div className="flex-1 overflow-hidden">
          {feed}
        </div>
      </aside>

      {/* Map */}
      <div className="flex-1 relative">
        {map}
      </div>

      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </div>
  )
}
