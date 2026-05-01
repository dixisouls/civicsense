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
  const [value, setValue] = useState("")

  useEffect(() => {
    let mounted = true
    loadMaps().then(() => {
      if (!mounted || !inputRef.current || autocompleteRef.current) return

      const ac = new google.maps.places.Autocomplete(inputRef.current, {
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
        setValue(place.formatted_address ?? "")
        onPlaceSelect({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address ?? "",
        })
      })

      autocompleteRef.current = ac
    })
    return () => { mounted = false }
  }, [onPlaceSelect])

  return (
    <div className="relative w-full">
      <div
        className="flex items-center rounded-lg overflow-hidden"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <span className="pl-3 flex-shrink-0" aria-hidden="true">
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 py-3 outline-none"
          style={{
            fontSize: "16px",
            color: "var(--color-text-1)",
            fontFamily: "var(--font-sans)",
          }}
          aria-label="Search location"
          autoComplete="off"
        />
        {value && (
          <button
            onClick={() => setValue("")}
            className="pr-3 flex-shrink-0"
            style={{ color: "var(--color-text-3)", minWidth: "44px", minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}
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
