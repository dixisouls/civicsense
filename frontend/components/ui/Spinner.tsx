interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  color?: string
}

const sizes = { sm: 16, md: 24, lg: 36 }

export function Spinner({ size = "md", color = "var(--color-text-2)" }: SpinnerProps) {
  const px = sizes[size]
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Loading"
      role="status"
      style={{ animation: "spin 0.75s linear infinite" }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="2.5"
        strokeOpacity="0.2"
      />
      <path
        d="M12 2 A10 10 0 0 1 22 12"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
