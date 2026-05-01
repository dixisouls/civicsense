"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useLocation } from "@/hooks/useLocation"
import { SignInModal } from "@/components/auth/SignInModal"
import { StepLocation } from "@/components/report/StepLocation"
import { StepPhoto } from "@/components/report/StepPhoto"
import { StepAnalysis } from "@/components/report/StepAnalysis"
import { StepDraft } from "@/components/report/StepDraft"
import type { ReportResponse } from "@/types"

type Step = 1 | 2 | 3 | 4

interface LocationData {
  lat: number
  lng: number
  address: string
}

const STEP_LABELS = ["Location", "Photo", "Analysis", "Draft"]

export default function ReportPage() {
  const { user, idToken, isLoading } = useAuth()
  const { coords, detect } = useLocation()
  const [signInOpen, setSignInOpen] = useState(false)
  const [step, setStep] = useState<Step>(1)
  const [location, setLocation] = useState<LocationData | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const [result, setResult] = useState<ReportResponse | null>(null)

  useEffect(() => {
    detect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isLoading && !user) setSignInOpen(true)
  }, [user, isLoading])

  const reset = () => {
    setStep(1)
    setLocation(null)
    setPhoto(null)
    setResult(null)
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--color-bg)",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          borderBottom: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          flexShrink: 0,
        }}
      >
        {step > 1 && step < 4 && (
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-2)",
              minWidth: 44,
              minHeight: 44,
              background: "none",
              border: "none",
              cursor: "pointer",
              marginLeft: -8,
            }}
            aria-label="Go back"
          >
            <BackIcon />
          </button>
        )}
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--color-text-1)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Report an issue
          </h1>
          <p style={{ fontSize: "12px", color: "var(--color-text-3)", fontFamily: "var(--font-mono)", marginTop: 1 }}>
            Step {step} of 4 — {STEP_LABELS[step - 1]}
          </p>
        </div>
      </header>

      {/* Progress bar */}
      <div
        style={{ height: 3, backgroundColor: "var(--color-border)", flexShrink: 0 }}
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={4}
        aria-label={`Step ${step} of 4`}
      >
        <div
          style={{
            height: "100%",
            width: `${(step / 4) * 100}%`,
            backgroundColor: "var(--color-accent)",
            transition: "width 350ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>

      {/* Step dots */}
      <div
        style={{
          display: "flex",
          padding: "10px 16px",
          gap: 8,
          flexShrink: 0,
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {STEP_LABELS.map((label, i) => {
          const n = (i + 1) as Step
          const active = n === step
          const done = n < step
          return (
            <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: done || active ? "var(--color-accent)" : "var(--color-border)",
                  transition: "background-color 0.2s",
                }}
                aria-hidden="true"
              />
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "var(--font-mono)",
                  color: active ? "var(--color-text-1)" : done ? "var(--color-text-2)" : "var(--color-text-3)",
                  letterSpacing: "0.04em",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Content */}
      <main
        style={{
          flex: 1,
          padding: "20px 16px 32px",
          overflowY: "auto",
          backgroundColor: "var(--color-bg)",
        }}
      >
        {!user && !isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "64px 0", textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "var(--color-text-2)" }}>Sign in to submit a report.</p>
            <button
              onClick={() => setSignInOpen(true)}
              style={{
                padding: "10px 24px",
                borderRadius: 10,
                backgroundColor: "var(--color-accent)",
                color: "#FFFFFF",
                fontSize: "13px",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
              }}
            >
              Sign in
            </button>
          </div>
        ) : (
          <>
            {step === 1 && (
              <StepLocation
                initialCoords={coords}
                onContinue={(data) => { setLocation(data); setStep(2) }}
              />
            )}
            {step === 2 && (
              <StepPhoto onContinue={(file) => { setPhoto(file); setStep(3) }} />
            )}
            {step === 3 && location && photo && idToken && (
              <StepAnalysis
                location={location}
                photo={photo}
                token={idToken}
                onContinue={(res) => { setResult(res); setStep(4) }}
              />
            )}
            {step === 4 && result && (
              <StepDraft result={result} onReportAnother={reset} />
            )}
          </>
        )}
      </main>

      <SignInModal
        isOpen={signInOpen}
        onClose={() => setSignInOpen(false)}
        message="Sign in to submit a report to SF 311."
      />
    </div>
  )
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}
