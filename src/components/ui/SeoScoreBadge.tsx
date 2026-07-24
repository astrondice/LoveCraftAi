// ─────────────────────────────────────────────────────────────────
// SeoScoreBadge — Live 0-100 SEO Health score indicator badge
// ─────────────────────────────────────────────────────────────────
import { Search } from "lucide-react";

interface SeoScoreBadgeProps {
  score?: number;
}

export function SeoScoreBadge({ score = 95 }: SeoScoreBadgeProps) {
  const getBadgeStyle = () => {
    if (score >= 90) return "bg-green-500/15 border-green-500/30 text-green-400";
    if (score >= 70) return "bg-gold/15 border-gold/30 text-gold";
    return "bg-destructive/15 border-destructive/30 text-destructive";
  };

  return (
    <div
      className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border label-caps text-[9px] font-bold ${getBadgeStyle()}`}
      title={`SEO Score: ${score}/100`}
    >
      <Search size={10} />
      <span>SEO {score}</span>
    </div>
  );
}
