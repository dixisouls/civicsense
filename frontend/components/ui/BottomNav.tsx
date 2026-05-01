"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { SignInModal } from "@/components/auth/SignInModal"

export function BottomNav() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [signInOpen, setSignInOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)

  const isMap = pathname === "/"
  const isReports = pathname === "/my-reports"

  const rawPhotoURL: string | null =
    user?.photoURL ?? user?.providerData?.[0]?.photoURL ?? null

  useEffect(() => {
    setImgFailed(false)
  }, [rawPhotoURL])

  const photoURL: string | null = imgFailed ? null : rawPhotoURL

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0].toUpperCase() ?? "?"

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 xl:hidden"
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
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            minHeight: 64,
            color: isMap ? "var(--color-accent)" : "var(--color-text-3)",
            textDecoration: "none",
          }}
          aria-label="Map"
          aria-current={isMap ? "page" : undefined}
        >
          <MapIcon active={isMap} />
          <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.05em", fontWeight: isMap ? 600 : 400 }}>
            Map
          </span>
        </Link>

        {/* Report — center pill */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <Link
            href="/report"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              backgroundColor: "var(--color-accent)",
              color: "#FFFFFF",
              borderRadius: 24,
              padding: "9px 18px",
              fontSize: "13px",
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              letterSpacing: "0.02em",
              boxShadow: "0 2px 12px rgba(201,56,0,0.28)",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
            aria-label="Report an issue"
          >
            <PlusIcon />
            Report
          </Link>
        </div>

        {/* My Reports */}
        <Link
          href="/my-reports"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            minHeight: 64,
            color: isReports ? "var(--color-accent)" : "var(--color-text-3)",
            textDecoration: "none",
          }}
          aria-label="My Reports"
          aria-current={isReports ? "page" : undefined}
        >
          <ListIcon active={isReports} />
          <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.05em", fontWeight: isReports ? 600 : 400 }}>
            Reports
          </span>
        </Link>

        {/* Account */}
        {user ? (
          <button
            onClick={() => setAccountOpen((o) => !o)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              minHeight: 64,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-3)",
              position: "relative",
            }}
            aria-label="Account"
          >
            {photoURL ? (
              <img
                src={photoURL}
                alt="Account"
                style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover", border: "1.5px solid var(--color-border)" }}
                width={24}
                height={24}
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                backgroundColor: "var(--color-surface-2)",
                border: "1.5px solid var(--color-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "9px", fontFamily: "var(--font-mono)", fontWeight: 700,
                color: "var(--color-text-1)",
              }}>
                {initials}
              </div>
            )}
            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
              Account
            </span>
          </button>
        ) : (
          <button
            onClick={() => setSignInOpen(true)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              minHeight: 64,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-3)",
            }}
            aria-label="Sign in"
          >
            <PersonIcon />
            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
              Sign in
            </span>
          </button>
        )}
      </nav>

      {/* Account bottom sheet */}
      {accountOpen && user && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "flex-end",
            backgroundColor: "rgba(0,0,0,0.15)",
          }}
          onClick={() => setAccountOpen(false)}
        >
          <div
            style={{
              width: "100%",
              backgroundColor: "var(--color-surface)",
              borderRadius: "20px 20px 0 0",
              paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
              boxShadow: "0 -4px 24px rgba(0,0,0,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{ padding: "12px 0 4px", display: "flex", justifyContent: "center" }}>
              <div style={{ width: 32, height: 4, borderRadius: 2, backgroundColor: "var(--color-border)" }} />
            </div>

            {/* Avatar + name */}
            <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid var(--color-border)" }}>
              {photoURL ? (
                <img
                  src={photoURL}
                  alt="Account"
                  style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--color-border)" }}
                  width={44}
                  height={44}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                />
              ) : (
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  backgroundColor: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "15px", fontFamily: "var(--font-mono)", fontWeight: 700,
                  color: "var(--color-text-1)",
                }}>
                  {initials}
                </div>
              )}
              <div>
                {user.displayName && (
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text-1)", marginBottom: 2 }}>
                    {user.displayName}
                  </p>
                )}
                {user.email && (
                  <p style={{ fontSize: "13px", color: "var(--color-text-2)" }}>
                    {user.email}
                  </p>
                )}
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={() => { signOut(); setAccountOpen(false) }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 20px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "15px",
                color: "var(--color-danger)",
                textAlign: "left",
              }}
            >
              <SignOutIcon />
              Sign out
            </button>
          </div>
        </div>
      )}

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
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
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

function SignOutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
