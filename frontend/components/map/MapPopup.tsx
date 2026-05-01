import { getCategoryColor, SEVERITY_COLORS } from "@/lib/constants"
import type { MapMarker, FeedItem } from "@/types"

export type PopupData = Pick<
  FeedItem,
  "id" | "category" | "address" | "days_open" | "source" | "severity" | "media_url"
> & { is_duplicate?: boolean }

export function renderMapPopupHTML(data: PopupData): string {
  const categoryColor = getCategoryColor(data.category)
  const severityColor =
    data.severity && data.severity !== "unknown"
      ? SEVERITY_COLORS[data.severity]
      : null

  const photo = data.media_url
    ? `<img src="${esc(data.media_url)}" alt="" style="width:100%;height:156px;object-fit:cover;display:block;" loading="lazy" width="280" height="156">`
    : `<div style="width:100%;height:100px;background:#EDE9E3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" stroke-width="1.5" stroke-linecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <span style="font-size:11px;color:#A8A29E;font-family:monospace;">No photo</span>
      </div>`

  const severityBadge = severityColor
    ? `<span style="display:inline-block;padding:2px 7px;border-radius:4px;font-size:10px;font-family:monospace;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${severityColor};background:${severityColor}12;border:1px solid ${severityColor}28;">${esc(data.severity!)}</span>`
    : ""

  const sourceBadge = data.source === "user"
    ? `<span style="display:inline-block;padding:2px 7px;border-radius:4px;font-size:10px;font-family:monospace;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#C93800;background:rgba(201,56,0,0.08);border:1px solid rgba(201,56,0,0.2);">You</span>`
    : ""

  const duplicate = data.is_duplicate
    ? `<p style="font-size:11px;color:#B45309;margin-top:8px;display:flex;align-items:center;gap:4px;">
        <span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:#B45309;flex-shrink:0;"></span>
        Linked to existing case
      </p>`
    : ""

  return `
    <div style="width:260px;background:#FFFFFF;border-radius:12px;overflow:hidden;font-family:system-ui,sans-serif;">
      ${photo}
      <div style="padding:12px 14px 14px;">
        <div style="display:flex;align-items:center;gap:5px;margin-bottom:8px;flex-wrap:wrap;">
          <span style="display:inline-flex;align-items:center;gap:4px;font-size:13px;font-weight:600;color:#1C1917;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${categoryColor};flex-shrink:0;"></span>
            ${esc(data.category ?? "Other")}
          </span>
          ${severityBadge}
          ${sourceBadge}
        </div>

        ${data.address ? `<p style="font-size:12px;color:#78716C;margin:0 0 6px;line-height:1.4;">${esc(data.address)}</p>` : ""}

        <p style="font-size:11px;color:#A8A29E;margin:0;font-family:monospace;">
          Open ${data.days_open}d
        </p>

        ${duplicate}
      </div>
    </div>
  `
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function markerDataFromFeedItem(item: FeedItem): PopupData {
  return {
    id: item.id,
    category: item.category,
    address: item.address,
    days_open: item.days_open,
    source: item.source,
    severity: item.severity,
    media_url: item.media_url,
    is_duplicate: false,
  }
}

export function markerDataFromMapMarker(marker: MapMarker): PopupData {
  return {
    id: marker.id,
    category: marker.category,
    address: null,
    days_open: 0,
    source: marker.source,
    severity: null,
    media_url: marker.media_url,
    is_duplicate: false,
  }
}
