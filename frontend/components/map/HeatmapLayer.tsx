"use client"

import { useEffect, useRef } from "react"
import type { HeatmapPoint } from "@/types"

interface HeatmapLayerProps {
  map: google.maps.Map
  points: HeatmapPoint[]
}

export function HeatmapLayer({ map, points }: HeatmapLayerProps) {
  const layerRef = useRef<google.maps.visualization.HeatmapLayer | null>(null)

  useEffect(() => {
    if (!map) return

    const data = points.map(
      (p) => new google.maps.LatLng(p.lat, p.lng),
    )

    if (!layerRef.current) {
      layerRef.current = new google.maps.visualization.HeatmapLayer({
        map,
        data,
        radius: 20,
        gradient: [
          "rgba(255, 76, 0, 0)",
          "rgba(255, 76, 0, 0.4)",
          "rgba(255, 76, 0, 0.7)",
          "rgba(255, 76, 0, 1)",
        ],
      })
    } else {
      layerRef.current.setData(data)
    }

    return () => {
      layerRef.current?.setMap(null)
      layerRef.current = null
    }
  }, [map, points])

  return null
}
