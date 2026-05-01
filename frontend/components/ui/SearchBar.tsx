"use client"

import { useEffect, useRef, useState } from "react"
import { loadMaps } from "@/lib/maps"
import { SF_BOUNDS } from "@/lib/constants"

interface PlaceResult {
  lat: number
  lng: number
  address: string
}

interface SearchBarProps {
  onPlaceSelect: (place: PlaceResult) => void
  placeholder?: string
}

export function SearchBar({
  onPlaceSelect,
  placeholder = "Search in San Francisco…",
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [value, setValue] = useState("")

  useEffect(() => {
    let mounted = true
    loadMaps().then(() => {
      if (!mounted || !inputRef.current || autocompleteRef.current) return

      const bounds = new google.maps.LatLngBounds(
        { lat: SF_BOUNDS.south, lng: SF_BOUNDS.west },
        { lat: SF_BOUNDS.north, lng: SF_BOUNDS.east },
      )

      // Full autocomplete for dropdown + selection
      const ac = new google.maps.places.Autocomplete(inputRef.current, {
        bounds,
        strictBounds: true,
        fields: ["geometry", "formatted_address"],
      })

      ac.addListener("place_changed", () => {
        const place = ac.getPlace()
        if (!place.geometry?.location) return
        const address = place.formatted_address ?? ""
        setValue(address)
        onPlaceSelect({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address,
        })
      })

      autocompleteRef.current = ac

      // For live pan-while-typing
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService()
      placesServiceRef.current = new google.maps.places.PlacesService(
        document.createElement("div"),
      )
    })
    return () => { mounted = false }
  }, [onPlaceSelect])

  // Live pan as user types
  useEffect(() => {
    if (!value || value.length < 4) return
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      const acService = autocompleteServiceRef.current
      const placesService = placesServiceRef.current
      if (!acService || !placesService) return

      acService.getPlacePredictions(
        {
          input: value,
          bounds: new google.maps.LatLngBounds(
            { lat: SF_BOUNDS.south, lng: SF_BOUNDS.west },
            { lat: SF_BOUNDS.north, lng: SF_BOUNDS.east },
          ),
          componentRestrictions: { country: "us" },
        },
        (predictions) => {
          if (!predictions || predictions.length === 0) return
          placesService.getDetails(
            { placeId: predictions[0].place_id, fields: ["geometry"] },
            (place) => {
              if (!place?.geometry?.location) return
              onPlaceSelect({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                address: predictions[0].description,
              })
            },
          )
        },
      )
    }, 600)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value, onPlaceSelect])

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <span style={{ paddingLeft: 12, flexShrink: 0 }} aria-hidden="true">
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            background: "transparent",
            padding: "12px 12px",
            outline: "none",
            fontSize: "15px",
            color: "var(--color-text-1)",
            fontFamily: "var(--font-sans)",
          }}
          aria-label="Search location"
          autoComplete="off"
        />
        {value && (
          <button
            onClick={() => setValue("")}
            style={{
              paddingRight: 12,
              flexShrink: 0,
              color: "var(--color-text-3)",
              minWidth: 44,
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            aria-label="Clear search"
          >
            <ClearIcon />
          </button>
        )}
      </div>
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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
