import { getCategoryColor, getStatusLabel, SEVERITY_COLORS } from "@/lib/constants"
import type { Severity, Source } from "@/types"

interface CategoryBadgeProps {
  category: string | null
}
interface SeverityBadgeProps {
  severity: Severity | null
}
interface SourceBadgeProps {
  source: Source
}
interface StatusBadgeProps {
  status: string
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const color = getCategoryColor(category)
  const label = category ?? "Other"
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "2px 8px 2px 6px",
        borderRadius: "6px",
        fontSize: "11px",
        fontFamily: "var(--font-mono)",
        fontWeight: 500,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
        backgroundColor: `${color}14`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          backgroundColor: color,
          flexShrink: 0,
          display: "inline-block",
        }}
      />
      {label}
    </span>
  )
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  if (!severity || severity === "unknown") return null
  const color = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.unknown
  const label = severity.charAt(0).toUpperCase() + severity.slice(1)
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 7px",
        borderRadius: "4px",
        fontSize: "11px",
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
        textTransform: "uppercase",
        backgroundColor: `${color}12`,
        color: color,
        border: `1px solid ${color}28`,
      }}
    >
      {label}
    </span>
  )
}

export function SourceBadge({ source }: SourceBadgeProps) {
  const isUser = source === "user"
  if (!isUser) return null
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 7px",
        borderRadius: "4px",
        fontSize: "10px",
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        letterSpacing: "0.06em",
        whiteSpace: "nowrap",
        textTransform: "uppercase",
        backgroundColor: "rgba(201,56,0,0.08)",
        color: "var(--color-accent)",
        border: "1px solid rgba(201,56,0,0.2)",
      }}
    >
      You
    </span>
  )
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = getStatusLabel(status)
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "2px 8px 2px 6px",
        borderRadius: "6px",
        fontSize: "11px",
        fontFamily: "var(--font-mono)",
        fontWeight: 500,
        whiteSpace: "nowrap",
        backgroundColor: "rgba(21,128,61,0.08)",
        color: "var(--color-success)",
        border: "1px solid rgba(21,128,61,0.2)",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          backgroundColor: "var(--color-success)",
          flexShrink: 0,
          display: "inline-block",
        }}
      />
      {label}
    </span>
  )
}
