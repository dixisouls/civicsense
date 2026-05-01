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
      className="min-h-screen flex flex-col pb-20"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <header
        className="flex items-center px-4 py-4"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <h1
          className="text-sm font-medium"
          style={{ color: "var(--color-text-1)", fontFamily: "var(--font-mono)" }}
        >
          My Reports
        </h1>
      </header>

      <main className="flex-1">
        {(isLoading || authLoading) && <FeedSkeleton />}

        {isError && (
          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
            <p style={{ fontSize: "13px", color: "var(--color-text-2)" }}>
              {error?.message ?? "Could not load your reports. Check your connection and try again."}
            </p>
          </div>
        )}

        {!isLoading && !authLoading && !isError && (!data || data.length === 0) && (
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-center" style={{ paddingTop: "96px" }}>
            <EmptyIcon />
            <p style={{ fontSize: "14px", color: "var(--color-text-2)" }}>
              You have not submitted any reports yet.
            </p>
            <Link
              href="/report"
              style={{
                fontSize: "14px",
                color: "var(--color-accent)",
                fontFamily: "var(--font-mono)",
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
              }}
            >
              Submit your first report
            </Link>
          </div>
        )}

        {data && data.map((item) => (
          <ReportRow key={item.id} item={item} />
        ))}
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
  return (
    <div
      className="flex items-start gap-3 px-4 py-4"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      {/* Thumbnail */}
      <div
        className="flex-shrink-0 rounded overflow-hidden"
        style={{
          width: "40px",
          height: "40px",
          backgroundColor: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
        }}
      >
        {item.media_url ? (
          <img
            src={item.media_url}
            alt={item.category ?? "Report photo"}
            className="w-full h-full object-cover"
            width={40}
            height={40}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImagePlaceholderIcon />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex flex-wrap gap-1.5">
          <CategoryBadge category={item.category} />
          {item.severity && <SeverityBadge severity={item.severity} />}
        </div>

        {item.address && (
          <span className="text-xs truncate" style={{ color: "var(--color-text-2)" }}>
            {item.address}
          </span>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={item.status} />
          <span
            style={{
              fontSize: "11px",
              color: "var(--color-text-3)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {formatDate(item.created_at)}
          </span>
        </div>
      </div>
    </div>
  )
}

function EmptyIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-3)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  )
}

function ImagePlaceholderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-3)" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}
