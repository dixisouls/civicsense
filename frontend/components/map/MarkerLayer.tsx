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
  const { setSelectedMarkerId, setCenter } = useMapStore()
  const clustererRef = useRef<MarkerClusterer | null>(null)
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([])

  useEffect(() => {
    if (!map) return

    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow({ disableAutoPan: false })
    }

    // Clear existing markers
    markersRef.current.forEach((m) => (m.map = null))
    markersRef.current = []
    clustererRef.current?.clearMarkers()

    const advancedMarkers = markers.map((data) => {
      const color = getCategoryColor(data.category)
      const pin = document.createElement("div")
      pin.style.cssText = `
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: ${color};
        border: 2px solid rgba(255,255,255,0.15);
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

        const popupData = markerDataFromMapMarker(data)
        const container = document.createElement("div")
        container.innerHTML = renderMapPopupHTML(popupData)

        infoWindowRef.current?.setContent(container)
        infoWindowRef.current?.open({ map, anchor: marker })
      })

      markersRef.current.push(marker)
      return marker
    })

    clustererRef.current = new MarkerClusterer({
      map,
      markers: advancedMarkers,
      renderer: {
        render: ({ count, position }) => {
          const el = document.createElement("div")
          el.style.cssText = `
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: #1C1C1C;
            border: 1.5px solid #2A2A2A;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: monospace;
            font-size: 11px;
            font-weight: 600;
            color: #F5F5F5;
            cursor: pointer;
          `
          el.textContent = String(count)
          return new google.maps.marker.AdvancedMarkerElement({
            position,
            content: el,
          })
        },
      },
    })

    return () => {
      markersRef.current.forEach((m) => (m.map = null))
      markersRef.current = []
      clustererRef.current?.clearMarkers()
    }
  }, [map, markers, setSelectedMarkerId, setCenter])

  return null
}
