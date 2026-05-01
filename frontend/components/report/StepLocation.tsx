"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { loadMaps } from "@/lib/maps"
import { geocode } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { SF_BOUNDS } from "@/lib/constants"

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
  const searchInputRef = useRef<HTMLInputElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [coords, setCoords] = useState(initialCoords)
  const [address, setAddress] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [geocoding, setGeocoding] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const moveMarker = useCallback((lat: number, lng: number) => {
    googleMapRef.current?.panTo({ lat, lng })
    if (markerRef.current) markerRef.current.position = { lat, lng }
    setCoords({ lat, lng })
  }, [])

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
        backgroundColor: "#F5F1EB",
        colorScheme: google.maps.ColorScheme.LIGHT,
      })

      const pinEl = document.createElement("div")
      pinEl.style.cssText = `
        width: 22px; height: 22px; border-radius: 50%;
        background: var(--color-accent);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
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

      // Map click to move marker
      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return
        const lat = e.latLng.lat()
        const lng = e.latLng.lng()
        marker.position = { lat, lng }
        setCoords({ lat, lng })
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => reverseGeocode(lat, lng), 500)
      })

      googleMapRef.current = map
      markerRef.current = marker

      reverseGeocode(initialCoords.lat, initialCoords.lng)

      // Address search autocomplete
      if (searchInputRef.current && !autocompleteRef.current) {
        const ac = new google.maps.places.Autocomplete(searchInputRef.current, {
          bounds: new google.maps.LatLngBounds(
            { lat: SF_BOUNDS.south, lng: SF_BOUNDS.west },
            { lat: SF_BOUNDS.north, lng: SF_BOUNDS.east },
          ),
          strictBounds: true,
          fields: ["geometry", "formatted_address"],
        })

        ac.addListener("place_changed", () => {
          const place = ac.getPlace()
          if (!place.geometry?.location) return
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          const addr = place.formatted_address ?? ""
          moveMarker(lat, lng)
          setAddress(addr)
          setConfirmed(true)
          setSearchValue(addr)
        })

        autocompleteRef.current = ac
      }
    })

    return () => {
      mounted = false
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [initialCoords, reverseGeocode, moveMarker])

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setDetecting(false)
        moveMarker(newCoords.lat, newCoords.lng)
        reverseGeocode(newCoords.lat, newCoords.lng)
        setSearchValue("")
      },
      () => setDetecting(false),
      { timeout: 5000 },
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Address search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <SearchIcon />
        <input
          ref={searchInputRef}
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search for an address…"
          style={{
            flex: 1,
            background: "transparent",
            outline: "none",
            fontSize: "15px",
            color: "var(--color-text-1)",
            fontFamily: "var(--font-sans)",
            border: "none",
          }}
          aria-label="Search address"
          autoComplete="off"
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue("")}
            style={{ color: "var(--color-text-3)", background: "none", border: "none", cursor: "pointer", padding: 4 }}
            aria-label="Clear"
          >
            <ClearIcon />
          </button>
        )}
      </div>

      {/* Map */}
      <div
        style={{
          borderRadius: 14,
          overflow: "hidden",
          height: 260,
          border: "1px solid var(--color-border)",
          flexShrink: 0,
        }}
      >
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <p style={{ fontSize: "12px", color: "var(--color-text-3)", textAlign: "center" }}>
        Drag the pin or tap the map to adjust location
      </p>

      {/* Use my location */}
      <button
        onClick={handleUseMyLocation}
        disabled={detecting}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "var(--color-accent)",
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          fontWeight: 500,
          background: "none",
          border: "none",
          cursor: detecting ? "default" : "pointer",
          minHeight: 44,
          alignSelf: "flex-start",
          padding: 0,
        }}
        aria-label="Use my current location"
      >
        <LocationIcon />
        {detecting ? "Detecting…" : "Use my location"}
      </button>

      {/* Confirmed address */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label
          htmlFor="address-display"
          style={{ fontSize: "11px", color: "var(--color-text-3)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em", textTransform: "uppercase" }}
        >
          Confirmed address
        </label>
        <div
          id="address-display"
          style={{
            padding: "11px 14px",
            borderRadius: 10,
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface-2)",
            fontSize: "14px",
            color: geocoding ? "var(--color-text-3)" : "var(--color-text-1)",
            minHeight: 44,
            display: "flex",
            alignItems: "center",
          }}
        >
          {geocoding ? "Looking up address…" : address || "Pin the location on the map"}
        </div>
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

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-3)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function ClearIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
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
