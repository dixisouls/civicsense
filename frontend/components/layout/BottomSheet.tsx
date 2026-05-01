"use client"

import { useRef, useState, useEffect, useCallback, type ReactNode } from "react"

export type SheetSnap = "peek" | "half" | "full"

const NAV_H = 64
const PEEK_H = 88

interface BottomSheetProps {
  children: ReactNode
  onSnapChange?: (snap: SheetSnap) => void
  defaultSnap?: SheetSnap
}

export function BottomSheet({ children, onSnapChange, defaultSnap = "peek" }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const [snap, setSnap] = useState<SheetSnap>(defaultSnap)
  const snapRef = useRef<SheetSnap>(defaultSnap)
  const dragging = useRef(false)
  const startClientY = useRef(0)
  const startTransY = useRef(0)
  const lastTransY = useRef(0)
  const initialized = useRef(false)

  const sheetH = useCallback(() => {
    if (typeof window === "undefined") return 700
    return window.innerHeight - NAV_H
  }, [])

  const getSnapY = useCallback((s: SheetSnap): number => {
    const h = sheetH()
    switch (s) {
      case "peek": return h - PEEK_H
      case "half": return h * 0.46
      case "full": return h * 0.04
    }
  }, [sheetH])

  const applyTransform = useCallback((y: number, animate: boolean) => {
    const el = sheetRef.current
    if (!el) return
    const clamped = Math.max(getSnapY("full") - 24, Math.min(sheetH() + 4, y))
    el.style.transition = animate
      ? "transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)"
      : "none"
    el.style.transform = `translateY(${clamped}px)`
    lastTransY.current = clamped
  }, [getSnapY, sheetH])

  const doSnap = useCallback((s: SheetSnap) => {
    applyTransform(getSnapY(s), true)
    snapRef.current = s
    setSnap(s)
    onSnapChange?.(s)
  }, [applyTransform, getSnapY, onSnapChange])

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      applyTransform(getSnapY(defaultSnap), false)
    }
  }, [applyTransform, defaultSnap, getSnapY])

  // Handle window resize
  useEffect(() => {
    const onResize = () => applyTransform(getSnapY(snapRef.current), false)
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [applyTransform, getSnapY])

  // Global pointer events for smooth drag
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      const delta = e.clientY - startClientY.current
      applyTransform(startTransY.current + delta, false)
    }

    const onUp = () => {
      if (!dragging.current) return
      dragging.current = false

      const y = lastTransY.current
      const peekY = getSnapY("peek")
      const halfY = getSnapY("half")
      const fullY = getSnapY("full")

      const closest = [
        { s: "peek" as SheetSnap, d: Math.abs(y - peekY) },
        { s: "half" as SheetSnap, d: Math.abs(y - halfY) },
        { s: "full" as SheetSnap, d: Math.abs(y - fullY) },
      ].reduce((a, b) => (a.d < b.d ? a : b)).s

      doSnap(closest)
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
    }
  }, [applyTransform, doSnap, getSnapY])

  const onHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragging.current = true
    startClientY.current = e.clientY
    startTransY.current = lastTransY.current
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handleTap = () => {
    if (dragging.current) return
    const next: Record<SheetSnap, SheetSnap> = { peek: "half", half: "full", full: "peek" }
    doSnap(next[snapRef.current])
  }

  return (
    <div
      ref={sheetRef}
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: NAV_H,
        height: `calc(100dvh - ${NAV_H}px)`,
        backgroundColor: "var(--color-surface)",
        borderRadius: "20px 20px 0 0",
        boxShadow: "0 -1px 0 var(--color-border), 0 -8px 32px rgba(0,0,0,0.08)",
        zIndex: 30,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        willChange: "transform",
      }}
    >
      {/* Drag handle */}
      <div
        onPointerDown={onHandlePointerDown}
        onClick={handleTap}
        style={{
          padding: "12px 0 0",
          flexShrink: 0,
          cursor: "ns-resize",
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        aria-label="Drag to resize panel"
        role="separator"
        aria-orientation="horizontal"
      >
        <div
          style={{
            width: 32,
            height: 4,
            borderRadius: 2,
            backgroundColor: "var(--color-border)",
            margin: "0 auto",
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: snap === "full" ? "auto" : "hidden",
          touchAction: snap === "full" ? "pan-y" : "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {children}
      </div>
    </div>
  )
}
