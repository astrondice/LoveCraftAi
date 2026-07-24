// ─────────────────────────────────────────────────────────────────
// QuotaBadge — Displays user plan and AI / website usage badge
// ─────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { Sparkles, Crown } from "lucide-react";
import { quotaService, type UserQuota } from "@/services/quota.service";
import { useAuth } from "@/hooks/use-auth";

export function QuotaBadge() {
  const { user } = useAuth();
  const [quota, setQuota] = useState<UserQuota | null>(null);

  useEffect(() => {
    if (user) {
      quotaService.getQuota(user.id).then((q) => setQuota(q));
    }
  }, [user]);

  if (!quota) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-ivory/5 border border-ivory/10 label-caps text-[10px]">
      {quota.plan === "pro" ? (
        <span className="flex items-center gap-1 text-gold font-bold">
          <Crown size={12} /> PRO Plan
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-ivory/70">
          <Sparkles size={11} className="text-gold" />
          <span>Free Plan</span>
          <span className="text-ivory/40">•</span>
          <span className="text-gold font-mono">{quota.ai_gen_count}/100 AI</span>
        </span>
      )}
    </div>
  );
}
