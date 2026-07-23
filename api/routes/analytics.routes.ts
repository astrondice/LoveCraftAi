// ─────────────────────────────────────────────────────────────────
// Analytics API Routes
// ─────────────────────────────────────────────────────────────────
import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import { authMiddleware } from "../middleware/auth";
import type { Bindings } from "../index";

export const analyticsRouter = new Hono<{ Bindings: Bindings }>();

// GET /api/analytics/:siteId — Auth: analytics summary for a site
analyticsRouter.get("/:siteId", authMiddleware, async (c) => {
  const userId = c.get("userId") as string;
  const { siteId } = c.req.param();
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  // Verify ownership
  const { data: site } = await supabase
    .from("websites")
    .select("id, title, status")
    .eq("id", siteId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!site) return c.json({ error: "Not found" }, 404);

  // Last 30 days events
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: events } = await supabase
    .from("analytics_events")
    .select("event_type, country, device, referrer, created_at")
    .eq("site_id", siteId)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  const views = (events ?? []).filter((e) => e.event_type === "view");

  // Views per day
  const byDate = new Map<string, number>();
  views.forEach((e) => {
    const d = (e.created_at as string).slice(0, 10);
    byDate.set(d, (byDate.get(d) ?? 0) + 1);
  });

  // Device breakdown
  const deviceMap = new Map<string, number>();
  views.forEach((e) => {
    const d = (e.device as string) ?? "unknown";
    deviceMap.set(d, (deviceMap.get(d) ?? 0) + 1);
  });

  return c.json({
    total_views: site.views,
    unique_visitors: site.unique_visitors,
    views_over_time: Array.from(byDate.entries()).map(([date, count]) => ({
      date,
      views: count,
    })),
    device_breakdown: Array.from(deviceMap.entries()).map(([device, count]) => ({
      device,
      count,
    })),
  });
});
