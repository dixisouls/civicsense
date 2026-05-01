"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { getMyReports } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import { SignInModal } from "@/components/auth/SignInModal"
import { CategoryBadge, SeverityBadge, StatusBadge } from "@/components/ui/Badge"
import { FeedSkeleton } from "@/components/feed/FeedSkeleton"
import { BottomNav } from "@/components/ui/BottomNav"
import { SEVERITY_COLORS } from "@/lib/constants"
import type { MyReportItem } from "@/types"

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function MyReportsPage() {
  const { user, idToken, isLoading: authLoading } = useAuth()
  const [signInOpen, setSignInOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) setSignInOpen(true)
  }, [user, authLoading])

  const { data, isLoading, isError, error } = useQuery<MyReportItem[], Error>({
    queryKey: ["my-reports", idToken],
    queryFn: () => getMyReports(idToken!),
    enabled: !!idToken,
  })

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--color-bg)",
        paddingBottom: 80,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 16px",
          borderBottom: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--color-text-1)",
            fontFamily: "var(--font-sans)",
          }}
        >
          My Reports
        </h1>
      </header>

      <main style={{ flex: 1 }}>
        {(isLoading || authLoading) && <FeedSkeleton />}

        {isError && (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "var(--color-text-2)" }}>
              {error?.message ?? "Couldn't load your reports. Check your connection."}
            </p>
          </div>
        )}

        {!isLoading && !authLoading && !isError && (!data || data.length === 0) && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "80px 24px", textAlign: "center" }}>
            <EmptyIcon />
            <div>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text-1)", marginBottom: 6 }}>
                No reports yet
              </p>
              <p style={{ fontSize: "13px", color: "var(--color-text-2)" }}>
                Help improve SF by reporting an issue.
              </p>
            </div>
            <Link
              href="/report"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "11px 22px",
                borderRadius: 10,
                backgroundColor: "var(--color-accent)",
                color: "#FFFFFF",
                fontSize: "13px",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Submit a report
            </Link>
          </div>
        )}

        {data && data.map((item) => <ReportRow key={item.id} item={item} />)}
      </main>

      <BottomNav />
      <SignInModal
        isOpen={signInOpen}
        onClose={() => setSignInOpen(false)}
        message="Sign in to view your reports."
      />
    </div>
  )
}

function ReportRow({ item }: { item: MyReportItem }) {
  const severityColor = item.severity && item.severity !== "unknown"
    ? SEVERITY_COLORS[item.severity]
    : null

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 16px",
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          flexShrink: 0,
          width: 52,
          height: 52,
          borderRadius: 10,
          overflow: "hidden",
          backgroundColor: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
        }}
      >
        {item.media_url ? (
          <img
            src={item.media_url}
            alt={item.category ?? "Report photo"}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            width={52}
            height={52}
            loading="lazy"
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ImageIcon />
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.category ?? "Other"}
          </span>
          <span style={{ fontSize: "11px", color: "var(--color-text-3)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
            {formatDate(item.created_at)}
          </span>
        </div>

        {item.address && (
          <span style={{ fontSize: "12px", color: "var(--color-text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.address}
          </span>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <StatusBadge status={item.status} />
          {item.severity && item.severity !== "unknown" && severityColor && (
            <span
              style={{
                padding: "2px 7px",
                borderRadius: 4,
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                backgroundColor: `${severityColor}12`,
                color: severityColor,
                border: `1px solid ${severityColor}28`,
              }}
            >
              {item.severity}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-3)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-3)" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}
