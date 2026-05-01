"use client"

import { useEffect, useState } from "react"
import { submitReport } from "@/lib/api"
import { Spinner } from "@/components/ui/Spinner"
import { CategoryBadge, SeverityBadge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
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

  const submit = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await submitReport(
        {
          lat: location.lat,
          lng: location.lng,
          address: location.address || null,
          neighborhood: null,
          photo,
        },
        token,
      )
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong on our end. Try again in a moment.")
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
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <Spinner size="lg" color="var(--color-accent)" />
        <p
          style={{
            fontSize: "14px",
            color: "var(--color-text-2)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Analysing your photo…
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-5 py-8">
        <div
          className="rounded-lg p-4 w-full"
          style={{
            backgroundColor: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
          role="alert"
        >
          <p style={{ fontSize: "13px", color: "var(--color-danger)" }}>{error}</p>
        </div>
        <Button variant="secondary" onClick={submit}>
          Try again
        </Button>
      </div>
    )
  }

  if (!result) return null

  const confidence = result.ai_confidence != null
    ? `${Math.round(result.ai_confidence * 100)}% confidence`
    : null

  return (
    <div className="flex flex-col gap-5">
      {/* Result card */}
      <div
        className="rounded-lg p-5 flex flex-col gap-4"
        style={{
          backgroundColor: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex flex-wrap gap-2 items-center">
          <CategoryBadge category={result.category} />
          {result.severity && <SeverityBadge severity={result.severity} />}
          {confidence && (
            <span
              style={{
                fontSize: "11px",
                color: "var(--color-text-3)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {confidence}
            </span>
          )}
        </div>

        {result.explanation && (
          <p style={{ fontSize: "13px", color: "var(--color-text-2)", lineHeight: "1.6" }}>
            {result.explanation}
          </p>
        )}
      </div>

      {/* Duplicate warning */}
      {result.is_duplicate && (
        <div
          className="rounded-lg p-4 flex gap-3"
          style={{
            backgroundColor: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.25)",
          }}
          role="alert"
        >
          <WarningIcon />
          <p style={{ fontSize: "13px", color: "#F59E0B", lineHeight: "1.5" }}>
            A similar issue has already been reported nearby. Your report has been recorded and linked to the existing case.
          </p>
        </div>
      )}

      <Button onClick={() => onContinue(result)} className="w-full">
        Continue
      </Button>
    </div>
  )
}

function WarningIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.75" strokeLinecap="round" className="flex-shrink-0 mt-0.5" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}
