"use client"

import { Component, type ReactNode, type ErrorInfo } from "react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center"
          style={{ backgroundColor: "var(--color-bg)" }}
        >
          <p style={{ fontSize: "14px", color: "var(--color-text-2)" }}>
            Something went wrong. Please reload the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm px-4 py-2 rounded"
            style={{
              color: "var(--color-accent)",
              border: "1px solid rgba(255,76,0,0.3)",
              fontFamily: "var(--font-mono)",
              minHeight: "44px",
            }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
