"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/Button"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"]
const MAX_SIZE_BYTES = 20 * 1024 * 1024

interface StepPhotoProps {
  onContinue: (photo: File) => void
}

export function StepPhoto({ onContinue }: StepPhotoProps) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const libraryRef = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = (file: File) => {
    setError(null)
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG, WebP, or HEIC images are supported.")
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Photo must be smaller than 20 MB.")
      return
    }
    setPhoto(file)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleRetake = () => {
    setPhoto(null)
    setPreview(null)
    setError(null)
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="flex flex-col gap-5">
      {!photo ? (
        <div
          className="rounded-lg flex flex-col items-center justify-center gap-4 p-8"
          style={{
            border: `2px dashed var(--color-border)`,
            minHeight: "200px",
          }}
        >
          <CameraIcon />
          <p className="text-sm text-center" style={{ color: "var(--color-text-2)" }}>
            Take a photo or choose from your library
          </p>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button
              onClick={() => cameraRef.current?.click()}
              className="w-full"
            >
              Take Photo
            </Button>
            <Button
              variant="secondary"
              onClick={() => libraryRef.current?.click()}
              className="w-full"
            >
              Choose from Library
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {preview && (
            <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
              <img
                src={preview}
                alt="Selected photo preview"
                className="w-full object-cover"
                style={{ maxHeight: "300px" }}
                width={600}
                height={300}
              />
            </div>
          )}

          <div
            className="flex items-center justify-between rounded-lg px-4 py-3"
            style={{
              backgroundColor: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span
                className="text-sm truncate"
                style={{ color: "var(--color-text-1)", fontFamily: "var(--font-mono)" }}
              >
                {photo.name}
              </span>
              <span className="text-xs" style={{ color: "var(--color-text-3)" }}>
                {formatBytes(photo.size)}
              </span>
            </div>
            <button
              onClick={handleRetake}
              className="text-xs ml-4 flex-shrink-0"
              style={{
                color: "var(--color-accent)",
                fontFamily: "var(--font-mono)",
                minHeight: "44px",
                minWidth: "44px",
              }}
              aria-label="Retake or replace photo"
            >
              Retake
            </button>
          </div>
        </div>
      )}

      {error && (
        <p
          className="text-sm rounded-lg px-3 py-2"
          style={{
            color: "var(--color-danger)",
            backgroundColor: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
          role="alert"
        >
          {error}
        </p>
      )}

      {/* Hidden inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInput}
        aria-hidden="true"
      />
      <input
        ref={libraryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInput}
        aria-hidden="true"
      />

      <Button
        onClick={() => photo && onContinue(photo)}
        disabled={!photo}
        className="w-full"
      >
        Continue
      </Button>
    </div>
  )
}

function CameraIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}
