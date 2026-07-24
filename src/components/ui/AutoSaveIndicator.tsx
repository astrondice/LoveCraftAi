// ─────────────────────────────────────────────────────────────────
// AutoSaveIndicator — Live status badge for draft auto-save
// ─────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { Cloud, CloudOff, Check, Loader2 } from "lucide-react";

interface AutoSaveIndicatorProps {
  status: "idle" | "saving" | "saved" | "error";
  lastSavedAt: Date | null;
}

export function AutoSaveIndicator({ status, lastSavedAt }: AutoSaveIndicatorProps) {
  const [, setTick] = useState(0);

  // Re-render every 5 seconds to update "X seconds ago" string
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  const getSavedText = () => {
    if (!lastSavedAt) return "Draft saved";
    const diffSec = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
    if (diffSec < 5) return "Saved just now";
    if (diffSec < 60) return `Saved ${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    return `Saved ${diffMin}m ago`;
  };

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-ivory/5 border border-ivory/10 text-[10px] label-caps transition-all">
      {status === "saving" && (
        <>
          <Loader2 size={12} className="text-gold animate-spin" />
          <span className="text-gold">Saving…</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check size={12} className="text-green-400" />
          <span className="text-ivory/70">{getSavedText()}</span>
        </>
      )}
      {status === "idle" && (
        <>
          <Cloud size={12} className="text-ivory/40" />
          <span className="text-ivory/50">{getSavedText()}</span>
        </>
      )}
      {status === "error" && (
        <>
          <CloudOff size={12} className="text-destructive" />
          <span className="text-destructive font-medium">Offline Draft</span>
        </>
      )}
    </div>
  );
}
