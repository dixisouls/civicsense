"use client"

import { create } from "zustand"
import type { SortOption, MapMode } from "@/types"
import { SF_CENTER } from "@/lib/constants"

interface MapState {
  center: { lat: number; lng: number }
  selectedMarkerId: string | null
  activeFilters: { category: string | null; sort: SortOption }
  mapMode: MapMode
  heatmapDateRange: { from: string; to: string }
  selectedNeighbourhood: string | null

  setCenter: (center: { lat: number; lng: number }) => void
  setSelectedMarkerId: (id: string | null) => void
  setCategory: (category: string | null) => void
  setSort: (sort: SortOption) => void
  setMapMode: (mode: MapMode) => void
  setHeatmapDateRange: (range: { from: string; to: string }) => void
  setSelectedNeighbourhood: (neighbourhood: string | null) => void
}

const defaultDateTo = new Date().toISOString().split("T")[0]
const defaultDateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split("T")[0]

export const useMapStore = create<MapState>((set) => ({
  center: SF_CENTER,
  selectedMarkerId: null,
  activeFilters: { category: null, sort: "nearest" },
  mapMode: "live",
  heatmapDateRange: { from: defaultDateFrom, to: defaultDateTo },
  selectedNeighbourhood: null,

  setCenter: (center) => set({ center }),
  setSelectedMarkerId: (id) => set({ selectedMarkerId: id }),
  setCategory: (category) =>
    set((s) => ({ activeFilters: { ...s.activeFilters, category } })),
  setSort: (sort) =>
    set((s) => ({ activeFilters: { ...s.activeFilters, sort } })),
  setMapMode: (mapMode) => set({ mapMode }),
  setHeatmapDateRange: (heatmapDateRange) => set({ heatmapDateRange }),
  setSelectedNeighbourhood: (selectedNeighbourhood) =>
    set({ selectedNeighbourhood }),
}))
