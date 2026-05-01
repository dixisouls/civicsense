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
    if (!isLoading && !user) {
      setSignInOpen(true)
    }
  }, [user, isLoading])

  const reset = () => {
    setStep(1)
    setLocation(null)
    setPhoto(null)
    setResult(null)
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Header */}
      <header
        className="flex items-center gap-4 px-4 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        {step > 1 && step < 4 && (
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
            className="flex items-center justify-center"
            style={{
              color: "var(--color-text-2)",
              minWidth: "44px",
              minHeight: "44px",
            }}
            aria-label="Go back"
          >
            <BackIcon />
          </button>
        )}
        <h1
          className="text-sm font-medium"
          style={{ color: "var(--color-text-1)", fontFamily: "var(--font-mono)" }}
        >
          Report an issue
        </h1>
      </header>

      {/* Progress bar */}
      <div
        className="flex-shrink-0"
        style={{
          height: "2px",
          backgroundColor: "var(--color-border)",
        }}
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={4}
        aria-label={`Step ${step} of 4: ${STEP_LABELS[step - 1]}`}
      >
        <div
          style={{
            height: "100%",
            width: `${(step / 4) * 100}%`,
            backgroundColor: "var(--color-accent)",
            transition: "width 300ms ease",
          }}
        />
      </div>

      {/* Step label */}
      <div className="flex px-4 py-3 gap-0 flex-shrink-0">
        {STEP_LABELS.map((label, i) => {
          const stepNum = (i + 1) as Step
          const active = stepNum === step
          const done = stepNum < step
          return (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="rounded-full"
                style={{
                  width: "6px",
                  height: "6px",
                  backgroundColor: done || active
                    ? "var(--color-accent)"
                    : "var(--color-border)",
                }}
                aria-hidden="true"
              />
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "var(--font-mono)",
                  color: active ? "var(--color-text-1)" : "var(--color-text-3)",
                  letterSpacing: "0.04em",
                }}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Content */}
      <main className="flex-1 px-4 py-4 pb-8 overflow-y-auto">
        {!user && !isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <p style={{ fontSize: "14px", color: "var(--color-text-2)" }}>
              Sign in to submit a report.
            </p>
            <button
              onClick={() => setSignInOpen(true)}
              className="text-sm"
              style={{
                color: "var(--color-accent)",
                fontFamily: "var(--font-mono)",
                minHeight: "44px",
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
                onContinue={(data) => {
                  setLocation(data)
                  setStep(2)
                }}
              />
            )}
            {step === 2 && (
              <StepPhoto
                onContinue={(file) => {
                  setPhoto(file)
                  setStep(3)
                }}
              />
            )}
            {step === 3 && location && photo && idToken && (
              <StepAnalysis
                location={location}
                photo={photo}
                token={idToken}
                onContinue={(res) => {
                  setResult(res)
                  setStep(4)
                }}
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
