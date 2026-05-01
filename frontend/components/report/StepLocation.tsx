"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { loadMaps } from "@/lib/maps"
import { geocode } from "@/lib/api"
import { Button } from "@/components/ui/Button"

interface LocationData {
  lat: number
  lng: number
  address: string
}

interface StepLocationProps {
  initialCoords: { lat: number; lng: number }
  onContinue: (data: LocationData) => void
}

export function StepLocation({ initialCoords, onContinue }: StepLocationProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [coords, setCoords] = useState(initialCoords)
  const [address, setAddress] = useState("")
  const [geocoding, setGeocoding] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setGeocoding(true)
    try {
      const result = await geocode({ lat, lng })
      setAddress(result.formatted_address)
      setConfirmed(true)
    } catch {
      setAddress("")
      setConfirmed(false)
    } finally {
      setGeocoding(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    loadMaps().then(() => {
      if (!mounted || !mapRef.current) return

      const map = new google.maps.Map(mapRef.current, {
        center: initialCoords,
        zoom: 16,
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID!,
        disableDefaultUI: true,
        gestureHandling: "greedy",
        clickableIcons: false,
        backgroundColor: "#0A0A0A",
        colorScheme: google.maps.ColorScheme.DARK,
      })

      const pinEl = document.createElement("div")
      pinEl.style.cssText = `
        width: 24px; height: 24px; border-radius: 50%;
        background: var(--color-accent, #FF4C00);
        border: 3px solid white;
        cursor: grab;
      `

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: initialCoords,
        content: pinEl,
        gmpDraggable: true,
        title: "Drag to adjust location",
      })

      marker.addListener("dragend", () => {
        const pos = marker.position as google.maps.LatLngLiteral
        if (!pos) return
        setCoords({ lat: pos.lat, lng: pos.lng })
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => reverseGeocode(pos.lat, pos.lng), 500)
      })

      googleMapRef.current = map
      markerRef.current = marker

      reverseGeocode(initialCoords.lat, initialCoords.lng)
    })

    return () => {
      mounted = false
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [initialCoords, reverseGeocode])

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCoords(newCoords)
        setDetecting(false)
        googleMapRef.current?.panTo(newCoords)
        if (markerRef.current) markerRef.current.position = newCoords
        reverseGeocode(newCoords.lat, newCoords.lng)
      },
      () => setDetecting(false),
      { timeout: 5000 },
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg overflow-hidden" style={{ height: "300px", border: "1px solid var(--color-border)" }}>
        <div ref={mapRef} className="w-full h-full" />
      </div>

      <button
        onClick={handleUseMyLocation}
        disabled={detecting}
        className="text-xs flex items-center gap-2 self-start transition-colors"
        style={{
          color: "var(--color-accent)",
          fontFamily: "var(--font-mono)",
          minHeight: "44px",
        }}
        aria-label="Use my current location"
      >
        <LocationIcon />
        {detecting ? "Detecting…" : "Use my location"}
      </button>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="address-input"
          className="text-xs"
          style={{ color: "var(--color-text-2)", fontFamily: "var(--font-mono)" }}
        >
          Confirmed address
        </label>
        <input
          id="address-input"
          type="text"
          value={geocoding ? "Looking up address…" : address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address will appear after pin placement"
          className="w-full rounded-lg px-3 py-3 outline-none"
          style={{
            backgroundColor: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-1)",
            fontSize: "16px",
          }}
          disabled={geocoding}
          aria-label="Confirmed address"
        />
      </div>

      <Button
        onClick={() => onContinue({ lat: coords.lat, lng: coords.lng, address })}
        disabled={!confirmed || geocoding}
        loading={geocoding}
        className="w-full"
      >
        Continue
      </Button>
    </div>
  )
}

function LocationIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
