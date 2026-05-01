import type {
  FeedParams,
  FeedResponse,
  MapParams,
  HeatmapParams,
  LiveMapResponse,
  HeatmapResponse,
  SummaryResult,
  ReportFormData,
  ReportResponse,
  MyReportItem,
  GeocodeParams,
  GeocodeResponse,
} from "@/types"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

function friendlyMessage(status: number, raw?: string): string {
  if (status === 0 || status >= 503) return "Check your connection and try again."
  if (status === 401 || status === 403) return "Please sign in to continue."
  if (status === 404) return "This could not be found."
  if (status === 422) return raw ?? "Invalid request."
  if (status >= 500) return "Something went wrong on our end. Try again in a moment."
  return raw ?? "An unexpected error occurred."
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, options)
  } catch {
    throw new ApiError(0, "Check your connection and try again.")
  }

  if (!res.ok) {
    let raw: string | undefined
    try {
      const body = await res.json()
      raw = body?.detail ?? body?.message
    } catch {
      // ignore parse failure
    }
    throw new ApiError(res.status, friendlyMessage(res.status, raw))
  }

  return res.json() as Promise<T>
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}

// ─── Endpoints ───────────────────────────────────────────────────────────────

export async function getFeed(params: FeedParams): Promise<FeedResponse> {
  const q = new URLSearchParams({
    lat: String(params.lat),
    lng: String(params.lng),
    radius_meters: String(params.radius_meters ?? 800),
    sort: params.sort ?? "nearest",
    ...(params.category ? { category: params.category } : {}),
  })
  return request<FeedResponse>(`/feed?${q}`)
}

export async function getLiveMap(params: MapParams): Promise<LiveMapResponse> {
  const q = new URLSearchParams({
    lat: String(params.lat),
    lng: String(params.lng),
    radius_meters: String(params.radius_meters ?? 5000),
    ...(params.category ? { category: params.category } : {}),
  })
  return request<LiveMapResponse>(`/map/live?${q}`)
}

export async function getHeatmap(params: HeatmapParams): Promise<HeatmapResponse> {
  const q = new URLSearchParams({
    date_from: params.date_from,
    date_to: params.date_to,
  })
  return request<HeatmapResponse>(`/map/heatmap?${q}`)
}

export async function getSummary(neighborhood: string): Promise<SummaryResult> {
  const q = new URLSearchParams({ neighborhood })
  let res: Response
  try {
    res = await fetch(`${BASE_URL}/summary?${q}`)
  } catch {
    throw new ApiError(0, "Check your connection and try again.")
  }

  if (res.status === 200 || res.status === 202) {
    return res.json() as Promise<SummaryResult>
  }

  let raw: string | undefined
  try {
    const body = await res.json()
    raw = body?.detail ?? body?.message
  } catch {
    // ignore
  }
  throw new ApiError(res.status, friendlyMessage(res.status, raw))
}

export async function submitReport(
  form: ReportFormData,
  token: string,
): Promise<ReportResponse> {
  const body = new FormData()
  body.append("lat", String(form.lat))
  body.append("lng", String(form.lng))
  if (form.address) body.append("address", form.address)
  if (form.neighborhood) body.append("neighborhood", form.neighborhood)
  body.append("photo", form.photo)

  return request<ReportResponse>("/report", {
    method: "POST",
    headers: authHeaders(token),
    body,
  })
}

export async function getMyReports(token: string): Promise<MyReportItem[]> {
  return request<MyReportItem[]>("/my-reports", {
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
  })
}

export async function geocode(params: GeocodeParams): Promise<GeocodeResponse> {
  const q = new URLSearchParams()
  if (params.address) q.set("address", params.address)
  if (params.lat != null) q.set("lat", String(params.lat))
  if (params.lng != null) q.set("lng", String(params.lng))
  return request<GeocodeResponse>(`/geocode?${q}`)
}
