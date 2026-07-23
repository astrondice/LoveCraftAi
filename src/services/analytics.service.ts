// ─────────────────────────────────────────────────────────────────
// Analytics Service
// ─────────────────────────────────────────────────────────────────
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { AnalyticsSummary, TrackEventInput } from "@/types";

function detectDevice(): "desktop" | "tablet" | "mobile" | "unknown" {
  if (typeof window === "undefined") return "unknown";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export const analyticsService = {
  /** Track a user event (view, download, etc.) */
  async track(input: TrackEventInput): Promise<void> {
    if (!isSupabaseConfigured) return;

    try {
      await supabase.from("analytics_events").insert({
        site_id: input.site_id,
        event_type: input.event_type,
        device: detectDevice(),
        referrer: input.referrer ?? (document.referrer || null),
      });
    } catch {
      // Analytics should never throw
    }
  },

  /** Get analytics summary for a site */
  async getSummary(siteId: string): Promise<AnalyticsSummary | null> {
    if (!isSupabaseConfigured) {
      return {
        total_views: 0,
        unique_visitors: 0,
        top_countries: [],
        top_cities: [],
        device_breakdown: [],
        referrer_breakdown: [],
        views_over_time: [],
        last_viewed_at: null,
      };
    }

    const { data } = await supabase
      .from("analytics_events")
      .select("*")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false });

    if (!data) return null;

    const views = data.filter((e) => e.event_type === "view");

    // Country breakdown
    const countryMap = new Map<string, number>();
    views.forEach((e) => {
      if (e.country) countryMap.set(e.country, (countryMap.get(e.country) ?? 0) + 1);
    });

    // Device breakdown
    const deviceMap = new Map<string, number>();
    views.forEach((e) => {
      const d = e.device ?? "unknown";
      deviceMap.set(d, (deviceMap.get(d) ?? 0) + 1);
    });

    // Views over time (last 30 days, grouped by date)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentViews = views.filter(
      (e) => new Date(e.created_at) >= thirtyDaysAgo,
    );
    const byDate = new Map<string, number>();
    recentViews.forEach((e) => {
      const d = e.created_at.slice(0, 10);
      byDate.set(d, (byDate.get(d) ?? 0) + 1);
    });

    return {
      total_views: views.length,
      unique_visitors: new Set(views.map((e) => e.ip_hash).filter(Boolean)).size,
      top_countries: Array.from(countryMap.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      top_cities: [],
      device_breakdown: Array.from(deviceMap.entries()).map(
        ([device, count]) => ({ device: device as "desktop", count }),
      ),
      referrer_breakdown: [],
      views_over_time: Array.from(byDate.entries())
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      last_viewed_at: data[0]?.created_at ?? null,
    };
  },
};
