import type { ButtonHTMLAttributes, ReactNode } from "react"
import { Spinner } from "./Spinner"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minHeight: "44px",
    padding: "0 20px",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "var(--font-mono)",
    fontWeight: 500,
    letterSpacing: "0.01em",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.5 : 1,
    transition: "opacity 150ms ease, background-color 150ms ease",
    border: "none",
    outline: "none",
    ...style,
  }

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: "var(--color-accent)",
      color: "#fff",
    },
    secondary: {
      backgroundColor: "transparent",
      color: "var(--color-text-1)",
      border: "1px solid var(--color-border)",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "var(--color-text-2)",
    },
  }

  return (
    <button
      disabled={disabled || loading}
      style={{ ...base, ...variants[variant] }}
      {...props}
    >
      {loading && <Spinner size="sm" color={variant === "primary" ? "#fff" : "var(--color-text-2)"} />}
      {children}
    </button>
  )
}
