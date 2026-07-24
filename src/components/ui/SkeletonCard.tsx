// ─────────────────────────────────────────────────────────────────
// SkeletonCard — Professional glass loader skeleton for site cards
// ─────────────────────────────────────────────────────────────────

export function SkeletonCard() {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden animate-pulse flex flex-col justify-between h-[280px]">
      <div>
        {/* Thumbnail loader */}
        <div className="h-36 bg-ivory/10 relative overflow-hidden" />
        {/* Content loader */}
        <div className="p-5 space-y-3">
          <div className="h-4 bg-ivory/15 rounded-full w-3/4" />
          <div className="h-3 bg-ivory/10 rounded-full w-1/2" />
          <div className="h-8 bg-ivory/5 rounded-xl w-full" />
        </div>
      </div>
      {/* Actions loader */}
      <div className="px-5 pb-5 pt-0 flex gap-2">
        <div className="h-9 bg-ivory/10 rounded-xl flex-1" />
        <div className="h-9 bg-ivory/10 rounded-xl flex-1" />
        <div className="h-9 bg-ivory/10 rounded-xl w-9" />
      </div>
    </div>
  );
}
