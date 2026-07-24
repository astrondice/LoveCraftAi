// ─────────────────────────────────────────────────────────────────
// AnalyticsModal — Detailed performance & view metrics modal
// ─────────────────────────────────────────────────────────────────
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { X, Eye, Users, Monitor, Smartphone, Tablet, BarChart3, Loader2 } from "lucide-react";
import { analyticsService } from "@/services/analytics.service";
import type { PublishedSite, AnalyticsSummary } from "@/types";

interface AnalyticsModalProps {
  site: PublishedSite | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AnalyticsModal({ site, isOpen, onClose }: AnalyticsModalProps) {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !site) return;
    setLoading(true);
    analyticsService
      .getSummary(site.id)
      .then((res: AnalyticsSummary | null) => setData(res))
      .catch((err: unknown) => console.error("[AnalyticsModal] error:", err))
      .finally(() => setLoading(false));
  }, [isOpen, site]);

  if (!isOpen || !site) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-charcoal/85 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel rounded-3xl p-6 md:p-8 w-full max-w-xl relative z-10 overflow-hidden shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full grid place-items-center text-ivory/40 hover:text-ivory hover:bg-ivory/10 transition-colors"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gold/15 border border-gold/30 grid place-items-center text-gold">
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="font-display text-2xl text-ivory leading-tight">{site.title}</h2>
              <p className="label-caps text-gold text-[10px] mt-0.5">Live Analytics & Reach</p>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <Loader2 size={32} className="text-gold animate-spin mx-auto mb-3" />
              <p className="text-ivory/50 text-sm">Gathering memory analytics…</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-ivory/5 border border-ivory/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-ivory/50 text-xs mb-1">
                    <Eye size={14} className="text-gold" /> Total Views
                  </div>
                  <p className="font-display text-3xl text-ivory">{data?.total_views ?? site.views ?? 0}</p>
                </div>
                <div className="bg-ivory/5 border border-ivory/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-ivory/50 text-xs mb-1">
                    <Users size={14} className="text-gold" /> Unique Visitors
                  </div>
                  <p className="font-display text-3xl text-ivory">{data?.unique_visitors ?? site.unique_visitors ?? 0}</p>
                </div>
              </div>

              {/* Devices breakdown */}
              <div>
                <h3 className="label-caps text-ivory/70 text-[11px] mb-3">Viewer Devices</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-ivory/5 border border-ivory/10 rounded-xl p-3 text-center">
                    <Smartphone size={16} className="text-gold mx-auto mb-1" />
                    <span className="text-ivory/40 text-[10px] uppercase block">Mobile</span>
                    <span className="text-ivory font-semibold text-sm">
                      {data?.device_breakdown?.find((d: { device: string; count: number }) => d.device === "mobile")?.count ?? 0}
                    </span>
                  </div>
                  <div className="bg-ivory/5 border border-ivory/10 rounded-xl p-3 text-center">
                    <Monitor size={16} className="text-gold mx-auto mb-1" />
                    <span className="text-ivory/40 text-[10px] uppercase block">Desktop</span>
                    <span className="text-ivory font-semibold text-sm">
                      {data?.device_breakdown?.find((d: { device: string; count: number }) => d.device === "desktop")?.count ?? 0}
                    </span>
                  </div>
                  <div className="bg-ivory/5 border border-ivory/10 rounded-xl p-3 text-center">
                    <Tablet size={16} className="text-gold mx-auto mb-1" />
                    <span className="text-ivory/40 text-[10px] uppercase block">Tablet</span>
                    <span className="text-ivory font-semibold text-sm">
                      {data?.device_breakdown?.find((d: { device: string; count: number }) => d.device === "tablet")?.count ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Views Timeline Table */}
              <div>
                <h3 className="label-caps text-ivory/70 text-[11px] mb-3">Daily Views (Recent)</h3>
                <div className="max-h-36 overflow-y-auto rounded-xl bg-ivory/5 border border-ivory/10 p-2 space-y-1">
                  {data?.views_over_time && data.views_over_time.length > 0 ? (
                    data.views_over_time.map((v: { date: string; views: number }) => (
                      <div key={v.date} className="flex justify-between items-center px-3 py-1.5 rounded-lg bg-ivory/5 text-xs">
                        <span className="text-ivory/60 font-mono">{v.date}</span>
                        <span className="text-gold font-bold">{v.views} views</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-ivory/40 text-xs">No view history recorded yet</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
