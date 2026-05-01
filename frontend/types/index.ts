export type Source = "311" | "user"
export type Severity = "low" | "medium" | "high" | "unknown"
export type SortOption = "stalest" | "hottest" | "nearest"
export type MapMode = "live" | "heatmap"

// ─── Feed ────────────────────────────────────────────────────────────────────

export interface FeedItem {
  id: string
  category: string | null
  address: string | null
  days_open: number
  source: Source
  severity: Severity | null
  status: string | null
  media_url: string | null
  neighborhood: string | null
  opened_date: string | null
}

export interface FeedResponse {
  items: FeedItem[]
  total: number
}

export interface FeedParams {
  lat: number
  lng: number
  radius_meters?: number
  category?: string | null
  sort?: SortOption
}

// ─── Map ─────────────────────────────────────────────────────────────────────

export interface MapMarker {
  id: string
  lat: number
  lng: number
  category: string | null
  source: Source
  media_url: string | null
}

export interface HeatmapPoint {
  lat: number
  lng: number
}

export interface LiveMapResponse {
  markers: MapMarker[]
}

export interface HeatmapResponse {
  points: HeatmapPoint[]
}

export interface MapParams {
  lat: number
  lng: number
  radius_meters?: number
  category?: string | null
}

export interface HeatmapParams {
  date_from: string
  date_to: string
}

// ─── Report ──────────────────────────────────────────────────────────────────

export interface Stub311Draft {
  service_name: string
  description: string
  address: string | null
  lat: number
  lng: number
  agency_responsible: string
  status: string
}

export interface ReportResponse {
  id: string
  category: string | null
  severity: Severity | null
  ai_label: string | null
  ai_confidence: number | null
  explanation: string | null
  address: string | null
  is_duplicate: boolean
  duplicate_of_case_id: string | null
  draft_311: Stub311Draft
  media_url: string | null
}

export interface ReportFormData {
  lat: number
  lng: number
  address: string | null
  neighborhood: string | null
  photo: File
}

export interface MyReportItem {
  id: string
  category: string | null
  severity: Severity | null
  address: string | null
  neighborhood: string | null
  status: string
  created_at: string
  is_duplicate: boolean
  media_url: string | null
}

// ─── Summary ─────────────────────────────────────────────────────────────────

export interface SummaryResponse {
  neighborhood: string
  summary: string
  total_cases: number
  cached: boolean
}

export interface SummaryGeneratingResponse {
  neighborhood: string
  status: "generating"
  message: string
}

export type SummaryResult = SummaryResponse | SummaryGeneratingResponse

// ─── Geocode ─────────────────────────────────────────────────────────────────

export interface GeocodeParams {
  address?: string
  lat?: number
  lng?: number
}

export interface GeocodeResponse {
  formatted_address: string
  lat: number
  lng: number
}

// ─── Errors ──────────────────────────────────────────────────────────────────

export interface ApiErrorData {
  message: string
  status: number
}
