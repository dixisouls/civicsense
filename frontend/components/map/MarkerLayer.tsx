"use client"

import { useEffect, useRef } from "react"
import { MarkerClusterer } from "@googlemaps/markerclusterer"
import { useMapStore } from "@/store/mapStore"
import { getCategoryColor } from "@/lib/constants"
import { renderMapPopupHTML, markerDataFromMapMarker } from "./MapPopup"
import type { MapMarker } from "@/types"

interface MarkerLayerProps {
  map: google.maps.Map
  markers: MapMarker[]
}

export function MarkerLayer({ map, markers }: MarkerLayerProps) {
  const { selectedMarkerId, setSelectedMarkerId, setCenter } = useMapStore()
  const clustererRef = useRef<MarkerClusterer | null>(null)
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([])
  // id → { marker element, raw data }
  const markerMapRef = useRef<Map<string, { marker: google.maps.marker.AdvancedMarkerElement; data: MapMarker }>>(new Map())

  // Build markers
  useEffect(() => {
    if (!map) return

    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow({ disableAutoPan: false })
    }

    markersRef.current.forEach((m) => (m.map = null))
    markersRef.current = []
    markerMapRef.current.clear()
    clustererRef.current?.clearMarkers()

    const advancedMarkers = markers.map((data) => {
      const color = getCategoryColor(data.category)
      const pin = document.createElement("div")
      pin.style.cssText = `
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background-color: ${color};
        border: 2.5px solid white;
        box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        cursor: pointer;
        transition: transform 150ms ease;
      `

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: data.lat, lng: data.lng },
        content: pin,
        title: data.category ?? "Issue",
      })

      marker.addListener("click", () => {
        setSelectedMarkerId(data.id)
        setCenter({ lat: data.lat, lng: data.lng })
        map.panTo({ lat: data.lat, lng: data.lng })
      })

      markersRef.current.push(marker)
      markerMapRef.current.set(data.id, { marker, data })
      return marker
    })

    clustererRef.current = new MarkerClusterer({
      map,
      markers: advancedMarkers,
      renderer: {
        render: ({ count, position }) => {
          const el = document.createElement("div")
          el.style.cssText = `
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: #FFFFFF;
            border: 1.5px solid #DDD8D0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.12);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: monospace;
            font-size: 11px;
            font-weight: 700;
            color: #1C1917;
            cursor: pointer;
          `
          el.textContent = String(count)
          return new google.maps.marker.AdvancedMarkerElement({ position, content: el })
        },
      },
    })

    return () => {
      markersRef.current.forEach((m) => (m.map = null))
      markersRef.current = []
      markerMapRef.current.clear()
      clustererRef.current?.clearMarkers()
    }
  }, [map, markers, setSelectedMarkerId, setCenter])

  // Open InfoWindow whenever selectedMarkerId changes (from feed tap OR direct marker click)
  useEffect(() => {
    if (!selectedMarkerId || !infoWindowRef.current || !map) return
    const entry = markerMapRef.current.get(selectedMarkerId)
    if (!entry) return

    const container = document.createElement("div")
    container.innerHTML = renderMapPopupHTML(markerDataFromMapMarker(entry.data))
    infoWindowRef.current.setContent(container)
    infoWindowRef.current.open({ map, anchor: entry.marker })
  }, [selectedMarkerId, map])

  return null
}
