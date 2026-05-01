"use client"

import { useEffect, useMemo, useState } from "react"
import { submitReport } from "@/lib/api"
import { Spinner } from "@/components/ui/Spinner"
import { Button } from "@/components/ui/Button"
import { SEVERITY_COLORS, getCategoryColor } from "@/lib/constants"
import type { ReportResponse } from "@/types"

interface StepAnalysisProps {
  location: { lat: number; lng: number; address: string }
  photo: File
  token: string
  onContinue: (result: ReportResponse) => void
}

export function StepAnalysis({ location, photo, token, onContinue }: StepAnalysisProps) {
  const [result, setResult] = useState<ReportResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const photoUrl = useMemo(() => URL.createObjectURL(photo), [photo])
  useEffect(() => () => URL.revokeObjectURL(photoUrl), [photoUrl])

  const submit = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await submitReport(
        { lat: location.lat, lng: location.lng, address: location.address || null, neighborhood: null, photo },
        token,
      )
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again in a moment.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    submit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Photo preview while loading */}
        <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--color-border)", aspectRatio: "4/3" }}>
          <img src={photoUrl} alt="Your photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "24px 0" }}>
          <Spinner size="lg" color="var(--color-accent)" />
          <p style={{ fontSize: "14px", color: "var(--color-text-2)", fontFamily: "var(--font-mono)" }}>
            Analysing your photo…
          </p>
          <p style={{ fontSize: "12px", color: "var(--color-text-3)", textAlign: "center" }}>
            AI is identifying the issue and preparing a 311 report draft
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--color-border)", aspectRatio: "4/3" }}>
          <img src={photoUrl} alt="Your photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div
          style={{ borderRadius: 12, padding: 16, backgroundColor: "rgba(185,28,28,0.06)", border: "1px solid rgba(185,28,28,0.2)" }}
          role="alert"
        >
          <p style={{ fontSize: "13px", color: "var(--color-danger)" }}>{error}</p>
        </div>
        <Button variant="secondary" onClick={submit}>Try again</Button>
      </div>
    )
  }

  if (!result) return null

  const severityColor = result.severity && result.severity !== "unknown"
    ? SEVERITY_COLORS[result.severity]
    : null
  const categoryColor = getCategoryColor(result.category)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Photo */}
      <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--color-border)", aspectRatio: "4/3" }}>
        <img src={photoUrl} alt="Reported issue" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Analysis result */}
      <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        {/* Header row */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 10, height: 10, borderRadius: "50%",
                backgroundColor: categoryColor, flexShrink: 0,
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-1)" }}>
              {result.category ?? "Unknown issue"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {severityColor && result.severity && (
              <span style={{
                padding: "3px 9px", borderRadius: 5,
                fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: 700,
                letterSpacing: "0.07em", textTransform: "uppercase",
                backgroundColor: `${severityColor}12`, color: severityColor,
                border: `1px solid ${severityColor}28`,
              }}>
                {result.severity}
              </span>
            )}
            {result.ai_confidence != null && (
              <span style={{ fontSize: "11px", color: "var(--color-text-3)", fontFamily: "var(--font-mono)" }}>
                {Math.round(result.ai_confidence * 100)}%
              </span>
            )}
          </div>
        </div>

        {/* Explanation */}
        {result.explanation && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
            <p style={{ fontSize: "13px", color: "var(--color-text-2)", lineHeight: 1.65 }}>
              {result.explanation}
            </p>
          </div>
        )}

        {/* Location */}
        {result.address && (
          <div style={{ padding: "11px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <PinIcon />
            <span style={{ fontSize: "12px", color: "var(--color-text-2)", lineHeight: 1.5 }}>
              {result.address}
            </span>
          </div>
        )}

        {/* 311 service + agency */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ padding: "11px 16px", borderRight: "1px solid var(--color-border)" }}>
            <p style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--color-text-3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
              311 Service
            </p>
            <p style={{ fontSize: "12px", color: "var(--color-text-1)", fontWeight: 500, lineHeight: 1.4 }}>
              {result.draft_311.service_name}
            </p>
          </div>
          <div style={{ padding: "11px 16px" }}>
            <p style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--color-text-3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
              Agency
            </p>
            <p style={{ fontSize: "12px", color: "var(--color-text-1)", fontWeight: 500, lineHeight: 1.4 }}>
              {result.draft_311.agency_responsible}
            </p>
          </div>
        </div>
      </div>

      {/* Duplicate warning */}
      {result.is_duplicate && (
        <div
          style={{ borderRadius: 12, padding: "12px 14px", display: "flex", gap: 10, backgroundColor: "rgba(180,83,9,0.06)", border: "1px solid rgba(180,83,9,0.2)" }}
          role="alert"
        >
          <WarningIcon />
          <p style={{ fontSize: "13px", color: "var(--color-warning)", lineHeight: 1.5 }}>
            A similar issue has already been reported nearby. Your report has been linked to the existing case.
          </p>
        </div>
      )}

      <Button onClick={() => onContinue(result)} className="w-full">
        Continue to draft
      </Button>
    </div>
  )
}

function PinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-3)" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}
