"use client"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/hooks/useAuth"

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
  message?: string
}

export function SignInModal({ isOpen, onClose, message }: SignInModalProps) {
  const { signInWithGoogle, linkMessage, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [signing, setSigning] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const firstFocusRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const prev = document.activeElement as HTMLElement | null
    firstFocusRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()

      if (e.key === "Tab") {
        const focusable = overlayRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      prev?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSignIn = async () => {
    setSigning(true)
    setError(null)
    try {
      await signInWithGoogle()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not sign in. Try again.")
    } finally {
      setSigning(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Sign in"
      ref={overlayRef}
    >
      <div
        className="w-full max-w-sm rounded-lg p-6 flex flex-col gap-5"
        style={{
          backgroundColor: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex flex-col gap-1">
          <h2
            className="text-lg font-medium"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-1)" }}
          >
            Sign in to continue
          </h2>
          {message && (
            <p className="text-sm" style={{ color: "var(--color-text-2)" }}>
              {message}
            </p>
          )}
        </div>

        {linkMessage && (
          <p
            className="text-sm rounded px-3 py-2"
            style={{
              color: "var(--color-success)",
              backgroundColor: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
            }}
          >
            {linkMessage}
          </p>
        )}

        {error && (
          <p
            className="text-sm rounded px-3 py-2"
            style={{
              color: "var(--color-danger)",
              backgroundColor: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            {error}
          </p>
        )}

        <button
          ref={firstFocusRef}
          onClick={handleSignIn}
          disabled={signing || isLoading}
          className="flex items-center justify-center gap-3 rounded w-full py-3 text-sm font-medium transition-opacity disabled:opacity-50"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-1)",
            minHeight: "44px",
            fontFamily: "var(--font-mono)",
          }}
          aria-label="Sign in with Google"
        >
          {signing ? (
            <span className="text-xs" style={{ color: "var(--color-text-2)" }}>
              Signing in…
            </span>
          ) : (
            <>
              <GoogleIcon />
              Continue with Google
            </>
          )}
        </button>

        <button
          onClick={onClose}
          className="text-xs self-center transition-colors"
          style={{ color: "var(--color-text-3)", minHeight: "44px" }}
          aria-label="Cancel sign in"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
