"use client"

import { useQuery } from "@tanstack/react-query"
import { getSummary } from "@/lib/api"
import type { SummaryResult } from "@/types"

function isGenerating(data: SummaryResult | undefined): boolean {
  return !!data && "status" in data && data.status === "generating"
}

export function useSummary(neighbourhood: string | null) {
  return useQuery<SummaryResult, Error>({
    queryKey: ["summary", neighbourhood],
    queryFn: () => getSummary(neighbourhood!),
    enabled: neighbourhood !== null,
    refetchInterval: (query) => {
      return isGenerating(query.state.data) ? 2000 : false
    },
    staleTime: 5 * 60_000,
  })
}
