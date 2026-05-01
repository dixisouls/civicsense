export const SF_CENTER = { lat: 37.7749, lng: -122.4194 }

export const SF_BOUNDS = {
  north: 37.83,
  south: 37.70,
  east: -122.35,
  west: -122.53,
}

export const CATEGORY_COLORS: Record<string, string> = {
  "Illegal Dumping": "#F59E0B",
  "Graffiti": "#8B5CF6",
  "Pothole": "#EF4444",
  "Blocked Sidewalk": "#3B82F6",
  "Overflowing Bin": "#10B981",
  "Streetlight Issue": "#FBBF24",
  "Other": "#6B7280",
}

export function getCategoryColor(category: string | null): string {
  if (!category) return CATEGORY_COLORS["Other"]
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS["Other"]
}

export const STATUS_LABELS: Record<string, string> = {
  "stub: submitted": "Submitted to 311",
}

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status
}

export const SEVERITY_COLORS: Record<string, string> = {
  low: "#22C55E",
  medium: "#F59E0B",
  high: "#EF4444",
  unknown: "#6B7280",
}

export const SORT_LABELS: Record<string, string> = {
  stalest: "Longest Open",
  hottest: "Most Active",
  nearest: "Nearest",
}

export const SF_NEIGHBORHOODS = [
  "Alamo Square",
  "Bayview",
  "Bernal Heights",
  "Castro",
  "Chinatown",
  "Civic Center",
  "Cole Valley",
  "Crocker Amazon",
  "Diamond Heights",
  "Dogpatch",
  "Excelsior",
  "Financial District",
  "Glen Park",
  "Haight-Ashbury",
  "Hayes Valley",
  "Inner Richmond",
  "Inner Sunset",
  "Japantown",
  "Lakeshore",
  "Lower Haight",
  "Lower Pacific Heights",
  "Marina",
  "Mission",
  "Mission Bay",
  "Nob Hill",
  "Noe Valley",
  "North Beach",
  "Outer Richmond",
  "Outer Sunset",
  "Pacific Heights",
  "Portola",
  "Potrero Hill",
  "Russian Hill",
  "SoMa",
  "Tenderloin",
  "Twin Peaks",
  "Visitacion Valley",
  "Western Addition",
]
