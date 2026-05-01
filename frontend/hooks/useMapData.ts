"use client"

import { useQuery } from "@tanstack/react-query"
import { getLiveMap, getHeatmap } from "@/lib/api"
import { useMapStore } from "@/store/mapStore"
import type { LiveMapResponse, HeatmapResponse } from "@/types"

export function useMapData(coords: { lat: number; lng: number }) {
  const { mapMode, heatmapDateRange, activeFilters } = useMapStore()

  const liveQuery = useQuery<LiveMapResponse, Error>({
    queryKey: ["map-live", coords.lat, coords.lng, activeFilters.category],
    queryFn: () =>
      getLiveMap({
        lat: coords.lat,
        lng: coords.lng,
        radius_meters: 5000,
        category: activeFilters.category,
      }),
    enabled: mapMode === "live",
    staleTime: 30_000,
  })

  const heatmapQuery = useQuery<HeatmapResponse, Error>({
    queryKey: ["map-heatmap", heatmapDateRange.from, heatmapDateRange.to],
    queryFn: () =>
      getHeatmap({
        date_from: heatmapDateRange.from,
        date_to: heatmapDateRange.to,
      }),
    enabled: mapMode === "heatmap",
    staleTime: 5 * 60_000,
  })

  return { liveQuery, heatmapQuery, mapMode }
}
