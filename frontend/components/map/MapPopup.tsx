import { getCategoryColor, SEVERITY_COLORS, getStatusLabel } from "@/lib/constants"
import type { MapMarker, FeedItem } from "@/types"

export type PopupData = Pick<
  FeedItem,
  "id" | "category" | "address" | "days_open" | "source" | "severity" | "media_url"
> & { is_duplicate?: boolean }

export function renderMapPopupHTML(data: PopupData): string {
  const categoryColor = getCategoryColor(data.category)
  const severityColor = data.severity && data.severity !== "unknown"
    ? SEVERITY_COLORS[data.severity]
    : null

  const photo = data.media_url
    ? `<img src="${escHtml(data.media_url)}" alt="" style="width:100%;height:160px;object-fit:cover;display:block;border-radius:8px 8px 0 0;" loading="lazy" width="280" height="160">`
    : ""

  const duplicate = data.is_duplicate
    ? `<p style="font-size:11px;color:#F59E0B;margin-top:8px;display:flex;align-items:center;gap:4px;">
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#F59E0B;flex-shrink:0;"></span>
        Linked to an existing case
      </p>`
    : ""

  const severity = severityColor
    ? `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:4px;font-size:11px;font-family:monospace;color:${severityColor};background:${severityColor}14;border:1px solid ${severityColor}30;">
        <span style="width:5px;height:5px;border-radius:50%;background:${severityColor};"></span>
        ${escHtml(data.severity!)}
      </span>`
    : ""

  const sourceBg = data.source === "user" ? "rgba(255,76,0,0.08)" : "#1C1C1C"
  const sourceColor = data.source === "user" ? "#FF4C00" : "#888888"
  const sourceBorder = data.source === "user" ? "rgba(255,76,0,0.2)" : "#2A2A2A"
  const sourceLabel = data.source === "user" ? "You reported" : "311"

  return `
    <div style="width:280px;background:#141414;border-radius:8px;overflow:hidden;font-family:system-ui,sans-serif;">
      ${photo}
      <div style="padding:12px 14px 14px;">
        <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px;">
          <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:4px;font-size:11px;font-family:monospace;color:#F5F5F5;background:#1C1C1C;border:1px solid #2A2A2A;">
            <span style="width:6px;height:6px;border-radius:50%;background:${categoryColor};display:inline-block;"></span>
            ${escHtml(data.category ?? "Other")}
          </span>
          <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:4px;font-size:11px;font-family:monospace;color:${sourceColor};background:${sourceBg};border:1px solid ${sourceBorder};">
            ${sourceLabel}
          </span>
          ${severity}
        </div>

        ${data.address ? `<p style="font-size:13px;color:#F5F5F5;margin:0 0 4px;line-height:1.4;">${escHtml(data.address)}</p>` : ""}

        <p style="font-size:12px;color:#888888;margin:0;font-family:monospace;">
          Open for ${data.days_open} day${data.days_open !== 1 ? "s" : ""}
        </p>

        ${duplicate}
      </div>
    </div>
  `
}

function escHtml(str: string): string {
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
