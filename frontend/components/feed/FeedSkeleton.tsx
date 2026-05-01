export function FeedSkeleton() {
  return (
    <div className="flex flex-col" aria-label="Loading feed" aria-busy="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-start gap-3 px-4 py-4"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div
            className="skeleton rounded-full flex-shrink-0"
            style={{ width: "10px", height: "10px", marginTop: "5px" }}
          />
          <div className="flex flex-col gap-2 flex-1">
            <div className="skeleton rounded" style={{ height: "12px", width: "60%" }} />
            <div className="skeleton rounded" style={{ height: "11px", width: "80%" }} />
            <div className="flex gap-2 mt-1">
              <div className="skeleton rounded" style={{ height: "20px", width: "60px" }} />
              <div className="skeleton rounded" style={{ height: "20px", width: "40px" }} />
            </div>
          </div>
          <div
            className="skeleton rounded flex-shrink-0"
            style={{ height: "20px", width: "36px" }}
          />
        </div>
      ))}
    </div>
  )
}
