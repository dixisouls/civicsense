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
    <div className="hidden xl:flex h-screen overflow-hidden" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 380,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRight: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--color-border)",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "var(--color-text-1)",
              fontFamily: "var(--font-mono)",
            }}
          >
            CIVICSENSE
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link
              href="/report"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 14px",
                borderRadius: 8,
                backgroundColor: "var(--color-accent)",
                color: "#FFFFFF",
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                letterSpacing: "0.02em",
                textDecoration: "none",
                boxShadow: "0 1px 6px rgba(201,56,0,0.25)",
              }}
            >
              + Report
            </Link>

            {user ? (
              <UserMenu />
            ) : (
              <button
                onClick={() => setSignInOpen(true)}
                style={{
                  fontSize: "12px",
                  color: "var(--color-text-2)",
                  fontFamily: "var(--font-mono)",
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                }}
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", flexShrink: 0 }}>
          {searchBar}
        </div>

        {/* Neighbourhood selector */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", flexShrink: 0 }}>
          {neighbourhoodSelector}
        </div>

        {/* Neighbourhood summary */}
        {neighbourhoodPanel && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", flexShrink: 0 }}>
            {neighbourhoodPanel}
          </div>
        )}

        {/* Feed */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {feed}
        </div>
      </aside>

      {/* Map */}
      <div style={{ flex: 1, position: "relative" }}>
        {map}
      </div>

      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </div>
  )
}
