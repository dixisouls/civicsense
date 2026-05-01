"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { SEVERITY_COLORS } from "@/lib/constants"
import type { ReportResponse } from "@/types"

interface StepDraftProps {
  result: ReportResponse
  onReportAnother: () => void
}

export function StepDraft({ result, onReportAnother }: StepDraftProps) {
  const [done, setDone] = useState(false)
  const { draft_311, severity, category, explanation, ai_confidence } = result

  if (done) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "48px 0", textAlign: "center" }}>
        {/* Success icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: "rgba(21,128,61,0.1)",
            border: "2px solid rgba(21,128,61,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckIcon />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-text-1)", fontFamily: "var(--font-sans)" }}>
            Report submitted
          </h2>
          <p style={{ fontSize: "14px", color: "var(--color-text-2)", maxWidth: 280, margin: "0 auto" }}>
            Your report has been recorded and SF 311 has been notified.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 300 }}>
          <Link
            href="/my-reports"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              padding: "13px",
              backgroundColor: "var(--color-accent)",
              color: "#FFFFFF",
              fontSize: "14px",
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            View my reports
          </Link>
          <button
            onClick={onReportAnother}
            style={{
              fontSize: "13px",
              color: "var(--color-text-2)",
              fontFamily: "var(--font-mono)",
              minHeight: 44,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Report another issue
          </button>
        </div>
      </div>
    )
  }

  const severityColor = severity && severity !== "unknown" ? SEVERITY_COLORS[severity] : null

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* AI analysis summary */}
      {(category || severity || explanation) && (
        <div
          style={{
            borderRadius: 14,
            padding: 16,
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--color-text-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              AI Analysis
            </span>
            {ai_confidence != null && (
              <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--color-text-3)" }}>
                {Math.round(ai_confidence * 100)}% confidence
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {category && (
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-1)" }}>
                {category}
              </span>
            )}
            {severityColor && severity && (
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  backgroundColor: `${severityColor}12`,
                  color: severityColor,
                  border: `1px solid ${severityColor}28`,
                }}
              >
                {severity} severity
              </span>
            )}
          </div>

          {explanation && (
            <p style={{ fontSize: "13px", color: "var(--color-text-2)", lineHeight: 1.6 }}>
              {explanation}
            </p>
          )}
        </div>
      )}

      {/* 311 Draft */}
      <div>
        <div style={{ marginBottom: 10 }}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-1)", fontFamily: "var(--font-sans)" }}>
            311 Draft
          </h2>
          <p style={{ fontSize: "12px", color: "var(--color-text-3)", marginTop: 2 }}>
            This will be submitted to SF 311 on your behalf.
          </p>
        </div>

        <div
          style={{
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          {[
            { label: "Service", value: draft_311.service_name },
            { label: "Description", value: draft_311.description },
            { label: "Address", value: draft_311.address },
            { label: "Agency", value: draft_311.agency_responsible },
            { label: "Status", value: draft_311.status },
          ].filter(f => f.value).map((field, i, arr) => (
            <div
              key={field.label}
              style={{
                padding: "12px 16px",
                borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-text-3)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {field.label}
              </span>
              <span style={{ fontSize: "13px", color: "var(--color-text-1)", lineHeight: 1.5 }}>
                {field.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={() => setDone(true)} className="w-full">
        Submit Report
      </Button>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
