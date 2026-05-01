"use client"

import { useSummary } from "@/hooks/useSummary"
import { ApiError } from "@/lib/api"

interface NeighborhoodSummaryProps {
  neighbourhood: string
}

export function NeighborhoodSummary({ neighbourhood }: NeighborhoodSummaryProps) {
  const { data, isLoading, isError, error } = useSummary(neighbourhood)

  if (isLoading || (data && "status" in data && data.status === "generating")) {
    return (
      <div
        className="rounded-lg p-4 flex flex-col gap-2"
        style={{
          backgroundColor: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
        }}
        aria-label="Loading neighborhood summary"
        aria-busy="true"
      >
        <div className="skeleton rounded" style={{ height: "14px", width: "50%" }} />
        <div className="skeleton rounded" style={{ height: "12px", width: "100%" }} />
        <div className="skeleton rounded" style={{ height: "12px", width: "90%" }} />
        <div className="skeleton rounded" style={{ height: "12px", width: "70%" }} />
      </div>
    )
  }

  if (isError) {
    const is422 =
      error instanceof ApiError && error.status === 422
    return (
      <div
        className="rounded-lg p-4"
        style={{
          backgroundColor: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
        }}
      >
        <p style={{ fontSize: "13px", color: "var(--color-text-2)" }}>
          {is422
            ? "No open cases found for this neighborhood."
            : "Summary unavailable right now."}
        </p>
      </div>
    )
  }

  if (!data || "status" in data) return null

  return (
    <div
      className="rounded-lg p-4 flex flex-col gap-3"
      style={{
        backgroundColor: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3
          className="text-sm font-medium"
          style={{ color: "var(--color-text-1)", fontFamily: "var(--font-mono)" }}
        >
          {data.neighborhood}
        </h3>
        <span
          style={{
            fontSize: "11px",
            color: "var(--color-text-3)",
            fontFamily: "var(--font-mono)",
            flexShrink: 0,
          }}
        >
          {data.total_cases} open case{data.total_cases !== 1 ? "s" : ""}
        </span>
      </div>
      <p style={{ fontSize: "13px", color: "var(--color-text-2)", lineHeight: "1.6" }}>
        {data.summary}
      </p>
    </div>
  )
}
