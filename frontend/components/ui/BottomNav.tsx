"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { SignInModal } from "@/components/auth/SignInModal"
import { UserMenu } from "@/components/auth/UserMenu"

const navItems = [
  {
    href: "/",
    label: "Map",
    icon: MapIcon,
  },
  {
    href: "/report",
    label: "Report",
    icon: PlusIcon,
    accent: true,
  },
  {
    href: "/my-reports",
    label: "My Reports",
    icon: ListIcon,
  },
]

export function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [signInOpen, setSignInOpen] = useState(false)

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden flex items-center"
        style={{
          backgroundColor: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
          paddingBottom: "env(safe-area-inset-bottom)",
          height: "calc(56px + env(safe-area-inset-bottom))",
        }}
        aria-label="Main navigation"
      >
        {navItems.map(({ href, label, icon: Icon, accent }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center flex-1 gap-1 transition-colors"
              style={{
                minHeight: "56px",
                color: active
                  ? "var(--color-accent)"
                  : "var(--color-text-2)",
              }}
              aria-label={label}
              aria-current={active ? "page" : undefined}
            >
              <span
                className="flex items-center justify-center rounded-full"
                style={
                  accent
                    ? {
                        width: "36px",
                        height: "36px",
                        backgroundColor: "var(--color-accent)",
                      }
                    : undefined
                }
              >
                <Icon color={accent ? "#fff" : active ? "var(--color-accent)" : "var(--color-text-2)"} />
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.04em",
                }}
              >
                {label}
              </span>
            </Link>
          )
        })}

        {/* Account tab */}
        {user ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-1" style={{ minHeight: "56px" }}>
            <UserMenu />
            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--color-text-2)", letterSpacing: "0.04em" }}>
              Account
            </span>
          </div>
        ) : (
          <button
            onClick={() => setSignInOpen(true)}
            className="flex flex-col items-center justify-center flex-1 gap-1"
            style={{ minHeight: "56px", color: "var(--color-text-2)" }}
            aria-label="Sign in"
          >
            <PersonIcon color="var(--color-text-2)" />
            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
              Account
            </span>
          </button>
        )}
      </nav>

      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  )
}

function MapIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  )
}

function PlusIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function ListIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="3.5" cy="6" r="1" fill={color} />
      <circle cx="3.5" cy="12" r="1" fill={color} />
      <circle cx="3.5" cy="18" r="1" fill={color} />
    </svg>
  )
}

function PersonIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
