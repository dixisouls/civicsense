"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"

export function UserMenu() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  if (!user) return null

  const initials = user.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user.email?.[0].toUpperCase() ?? "?"

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center rounded-full text-xs font-medium"
        style={{
          width: "32px",
          height: "32px",
          backgroundColor: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-1)",
          fontFamily: "var(--font-mono)",
          minWidth: "44px",
          minHeight: "44px",
        }}
        aria-label="Account menu"
        aria-expanded={open}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName ?? "Account"}
            className="rounded-full w-8 h-8 object-cover"
            width={32}
            height={32}
          />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 rounded-lg py-1 z-50"
          style={{
            backgroundColor: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            minWidth: "160px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}
        >
          {user.email && (
            <p
              className="px-4 py-2 text-xs truncate"
              style={{ color: "var(--color-text-2)" }}
            >
              {user.email}
            </p>
          )}
          <button
            onClick={() => { signOut(); setOpen(false) }}
            className="w-full text-left px-4 py-2 text-sm transition-colors"
            style={{
              color: "var(--color-text-1)",
              fontFamily: "var(--font-mono)",
              minHeight: "44px",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--color-surface)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
