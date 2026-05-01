export const SF_CENTER = { lat: 37.7749, lng: -122.4194 }

export const SF_BOUNDS = {
  north: 37.83,
  south: 37.70,
  east: -122.35,
  west: -122.53,
}

export const CATEGORY_COLORS: Record<string, string> = {
  "Illegal Dumping": "#C05621",
  "Graffiti": "#6D28D9",
  "Pothole": "#B91C1C",
  "Blocked Sidewalk": "#1D4ED8",
  "Overflowing Bin": "#065F46",
  "Streetlight Issue": "#92400E",
  "Other": "#57534E",
}

export function getCategoryColor(category: string | null): string {
  if (!category) return CATEGORY_COLORS["Other"]
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS["Other"]
}

export const STATUS_LABELS: Record<string, string> = {
  "stub: submitted": "Report Submitted",
}

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status
}

export const SEVERITY_COLORS: Record<string, string> = {
  low: "#15803D",
  medium: "#B45309",
  high: "#B91C1C",
  unknown: "#78716C",
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
