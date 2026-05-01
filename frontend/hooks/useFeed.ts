"use client"

import { useQuery } from "@tanstack/react-query"
import { getFeed } from "@/lib/api"
import { useMapStore } from "@/store/mapStore"
import type { FeedResponse } from "@/types"

export function useFeed(coords: { lat: number; lng: number }) {
  const { activeFilters } = useMapStore()

  return useQuery<FeedResponse, Error>({
    queryKey: ["feed", coords.lat, coords.lng, activeFilters],
    queryFn: () =>
      getFeed({
        lat: coords.lat,
        lng: coords.lng,
        radius_meters: 800,
        category: activeFilters.category,
        sort: activeFilters.sort,
      }),
    staleTime: 30_000,
  })
}
