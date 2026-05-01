"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import type { ReportResponse } from "@/types"

interface StepDraftProps {
  result: ReportResponse
  onReportAnother: () => void
}

const labelStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "var(--color-text-3)",
  fontFamily: "var(--font-mono)",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
}

const valueStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "var(--color-text-1)",
  lineHeight: "1.5",
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-1">
      <span style={labelStyle}>{label}</span>
      <span style={valueStyle}>{value}</span>
    </div>
  )
}

export function StepDraft({ result, onReportAnother }: StepDraftProps) {
  const [done, setDone] = useState(false)
  const { draft_311 } = result

  if (done) {
    return (
      <div className="flex flex-col items-center gap-6 py-12 text-center">
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: "72px",
            height: "72px",
            backgroundColor: "rgba(255,76,0,0.1)",
            border: "1.5px solid rgba(255,76,0,0.3)",
          }}
          aria-hidden="true"
        >
          <CheckIcon />
        </div>

        <div className="flex flex-col gap-2">
          <h2
            className="text-xl font-medium"
            style={{ color: "var(--color-text-1)", fontFamily: "var(--font-mono)" }}
          >
            Report submitted
          </h2>
          <p style={{ fontSize: "14px", color: "var(--color-text-2)" }}>
            Your report has been recorded. SF 311 has been notified.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/my-reports"
            className="flex items-center justify-center rounded-lg w-full py-3 text-sm font-medium transition-colors"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "#fff",
              fontFamily: "var(--font-mono)",
              minHeight: "44px",
            }}
          >
            View my reports
          </Link>
          <button
            onClick={onReportAnother}
            className="text-sm"
            style={{
              color: "var(--color-text-2)",
              fontFamily: "var(--font-mono)",
              minHeight: "44px",
            }}
          >
            Report another issue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2
          className="text-sm font-medium mb-1"
          style={{ color: "var(--color-text-1)", fontFamily: "var(--font-mono)" }}
        >
          311 Draft
        </h2>
        <p style={{ fontSize: "12px", color: "var(--color-text-3)" }}>
          This draft will be submitted to SF 311 on your behalf.
        </p>
      </div>

      <div
        className="rounded-lg p-5 flex flex-col gap-4"
        style={{
          backgroundColor: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
        }}
      >
        <Field label="Service" value={draft_311.service_name} />
        <Field label="Description" value={draft_311.description} />
        <Field label="Address" value={draft_311.address} />
        <Field label="Agency" value={draft_311.agency_responsible} />
        <Field label="Status" value={draft_311.status} />
      </div>

      <Button onClick={() => setDone(true)} className="w-full">
        Done
      </Button>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
