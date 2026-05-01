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

const baseBadge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  paddingLeft: "7px",
  paddingRight: "7px",
  paddingTop: "3px",
  paddingBottom: "3px",
  borderRadius: "4px",
  fontSize: "11px",
  fontFamily: "var(--font-mono)",
  fontWeight: 500,
  letterSpacing: "0.02em",
  whiteSpace: "nowrap",
}

function Dot({ color }: { color: string }) {
  return (
    <span
      style={{
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        backgroundColor: color,
        flexShrink: 0,
      }}
      aria-hidden="true"
    />
  )
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const color = getCategoryColor(category)
  const label = category ?? "Other"
  return (
    <span
      style={{
        ...baseBadge,
        color: "var(--color-text-1)",
        backgroundColor: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
      }}
    >
      <Dot color={color} />
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
        ...baseBadge,
        color,
        backgroundColor: `${color}14`,
        border: `1px solid ${color}30`,
      }}
    >
      <Dot color={color} />
      {label}
    </span>
  )
}

export function SourceBadge({ source }: SourceBadgeProps) {
  const isUser = source === "user"
  return (
    <span
      style={{
        ...baseBadge,
        color: isUser ? "var(--color-accent)" : "var(--color-text-2)",
        backgroundColor: isUser ? "rgba(255,76,0,0.08)" : "var(--color-surface-2)",
        border: `1px solid ${isUser ? "rgba(255,76,0,0.2)" : "var(--color-border)"}`,
      }}
    >
      {isUser ? "You reported" : "311"}
    </span>
  )
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = getStatusLabel(status)
  return (
    <span
      style={{
        ...baseBadge,
        color: "var(--color-success)",
        backgroundColor: "rgba(34,197,94,0.08)",
        border: "1px solid rgba(34,197,94,0.2)",
      }}
    >
      <Dot color="var(--color-success)" />
      {label}
    </span>
  )
}
