"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { SignInModal } from "@/components/auth/SignInModal"
import { UserMenu } from "@/components/auth/UserMenu"

export function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [signInOpen, setSignInOpen] = useState(false)

  const isMap = pathname === "/"
  const isReports = pathname === "/my-reports"

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
        style={{
          backgroundColor: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
          paddingBottom: "env(safe-area-inset-bottom)",
          height: "calc(64px + env(safe-area-inset-bottom))",
          display: "flex",
          alignItems: "center",
        }}
        aria-label="Main navigation"
      >
        {/* Map */}
        <Link
          href="/"
          className="flex flex-col items-center justify-center flex-1 gap-1"
          style={{ minHeight: "64px", color: isMap ? "var(--color-accent)" : "var(--color-text-3)" }}
          aria-label="Map"
          aria-current={isMap ? "page" : undefined}
        >
          <MapIcon active={isMap} />
          <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.05em", fontWeight: isMap ? 600 : 400 }}>
            Map
          </span>
        </Link>

        {/* Report — center pill */}
        <div className="flex flex-col items-center justify-center flex-1">
          <Link
            href="/report"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "var(--color-accent)",
              color: "#FFFFFF",
              borderRadius: "24px",
              padding: "10px 20px",
              fontSize: "13px",
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              letterSpacing: "0.02em",
              boxShadow: "0 2px 12px rgba(201,56,0,0.3)",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
            aria-label="Report an issue"
          >
            <PlusIcon />
            Report
          </Link>
        </div>

        {/* My Reports or Account */}
        {user ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-1" style={{ minHeight: "64px" }}>
            <Link
              href="/my-reports"
              className="flex flex-col items-center gap-1"
              style={{ color: isReports ? "var(--color-accent)" : "var(--color-text-3)" }}
              aria-label="My Reports"
              aria-current={isReports ? "page" : undefined}
            >
              <ListIcon active={isReports} />
              <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.05em", fontWeight: isReports ? 600 : 400 }}>
                Reports
              </span>
            </Link>
          </div>
        ) : (
          <button
            onClick={() => setSignInOpen(true)}
            className="flex flex-col items-center justify-center flex-1 gap-1"
            style={{ minHeight: "64px", color: "var(--color-text-3)" }}
            aria-label="Sign in"
          >
            <PersonIcon />
            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
              Sign in
            </span>
          </button>
        )}
      </nav>

      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  )
}

function MapIcon({ active }: { active: boolean }) {
  const c = active ? "var(--color-accent)" : "var(--color-text-3)"
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={active ? 2 : 1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function ListIcon({ active }: { active: boolean }) {
  const c = active ? "var(--color-accent)" : "var(--color-text-3)"
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={active ? 2 : 1.75} strokeLinecap="round" aria-hidden="true">
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
      <circle cx="4" cy="6" r="1.5" fill={c} stroke="none" />
      <circle cx="4" cy="12" r="1.5" fill={c} stroke="none" />
      <circle cx="4" cy="18" r="1.5" fill={c} stroke="none" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-3)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
