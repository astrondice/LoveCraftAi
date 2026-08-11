// ─────────────────────────────────────────────────────────────────
// Promotional Videos & Campaigns API Routes (Hono Worker)
// ─────────────────────────────────────────────────────────────────
import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import { adminMiddleware } from "../middleware/auth";
import type { Bindings, Variables } from "../index";

export const promoVideoRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ── Public Endpoint: GET /api/promo-videos ─────────────────────────
// Fetch active promotional videos for homepage or category
promoVideoRouter.get("/promo-videos", async (c) => {
  const category = c.req.query("category");
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  let query = supabase
    .from("promotional_videos")
    .select("*")
    .eq("is_active", true)
    .order("priority", { ascending: false })
    .order("display_order", { ascending: true });

  if (category && category !== "all") {
    query = query.in("category", [category, "global"]);
  }

  const { data, error } = await query;
  if (error) return c.json({ error: error.message }, 500);

  const now = new Date().toISOString();
  const activeData = (data || []).filter((v) => {
    if (v.start_at && new Date(v.start_at).toISOString() > now) return false;
    if (v.end_at && new Date(v.end_at).toISOString() < now) return false;
    return true;
  });

  return c.json(activeData);
});

// ── Public Endpoint: GET /api/promo-campaigns ──────────────────────
// Fetch active promotional campaigns with assets
promoVideoRouter.get("/promo-campaigns", async (c) => {
  const category = c.req.query("category");
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  let query = supabase
    .from("promotional_campaigns")
    .select("*, assets:promotional_videos(*)")
    .eq("is_active", true)
    .order("priority", { ascending: false });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// ── Public Endpoint: POST /api/promo-videos/:id/event ─────────────
// Track video analytics event (impression, play, 25%, 50%, 75%, complete, cta_click)
promoVideoRouter.post("/promo-videos/:id/event", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ event_type: string; category?: string }>();

  // Skip analytics logging for fallback client IDs
  if (id.startsWith("fallback-")) {
    return c.json({ success: true });
  }

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  await supabase.from("promotional_video_events").insert({
    video_id: id,
    event_type: body.event_type,
    category: body.category || "global",
    user_agent: c.req.header("user-agent") || null,
  });

  return c.json({ success: true });
});

// ── Admin Endpoints (Strict Admin Security Middleware) ────────────
promoVideoRouter.use("/admin/promo-videos/*", adminMiddleware);
promoVideoRouter.use("/admin/promo-campaigns/*", adminMiddleware);

// GET /api/admin/promo-videos — List all videos for admin dashboard
promoVideoRouter.get("/admin/promo-videos", async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: videos, error } = await supabase
    .from("promotional_videos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return c.json({ error: error.message }, 500);
  return c.json(videos);
});

// POST /api/admin/promo-videos — Create promotional video / image asset
promoVideoRouter.post("/admin/promo-videos", async (c) => {
  const body = await c.req.json<{ video_url?: string }>();
  
  // Security File Extension Check
  if (body.video_url) {
    const urlLower = body.video_url.toLowerCase();
    const dangerousExts = [".exe", ".sh", ".php", ".js", ".html", ".bat", ".cmd", ".dll", ".ps1"];
    if (dangerousExts.some((ext) => urlLower.includes(ext))) {
      return c.json({ error: "Forbidden file format" }, 400);
    }
  }

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from("promotional_videos")
    .insert(body)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

// PATCH /api/admin/promo-videos/:id — Update promotional video
promoVideoRouter.patch("/admin/promo-videos/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from("promotional_videos")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// DELETE /api/admin/promo-videos/:id — Delete promotional video
promoVideoRouter.delete("/admin/promo-videos/:id", async (c) => {
  const id = c.req.param("id");
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { error } = await supabase
    .from("promotional_videos")
    .delete()
    .eq("id", id);

  if (error) return c.json({ error: error.message }, 500);
  return c.body(null, 204);
});
