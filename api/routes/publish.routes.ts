// ─────────────────────────────────────────────────────────────────
// Publish API Routes
// Uses exact public.websites schema:
// (id, user_id, title, slug, website_type, status, blueprint_json, preview_image, published_html, created_at, updated_at)
// ─────────────────────────────────────────────────────────────────
import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import { authMiddleware } from "../middleware/auth";
import type { Bindings, Variables } from "../index";

export const publishRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// GET /api/publish/sites/:id — Public: fetch active published website metadata
publishRouter.get("/sites/:id", async (c) => {
  const { id } = c.req.param();
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  // 1. Try public RPC get_public_site first to resolve active published version
  const { data: rpcData, error: rpcError } = await supabase.rpc("get_public_site", { p_site_id: id });
  const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;

  if (!rpcError && row && row.html_url) {
    return c.json({
      id: row.id,
      title: row.title,
      website_type: row.website_type ?? null,
      preview_image: row.preview_image ?? null,
      html_url: row.html_url,
      published_at: row.published_at ?? null,
    });
  }

  // 2. Direct query on active website record selecting ONLY safe public columns
  const { data, error } = await supabase
    .from("websites")
    .select("id, title, website_type, status, preview_image, published_html, published_at")
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data || !data.published_html) {
    return c.json({ error: "Site not found" }, 404);
  }

  return c.json({
    id: data.id,
    title: data.title,
    website_type: data.website_type ?? null,
    preview_image: data.preview_image ?? null,
    html_url: data.published_html,
    published_at: data.published_at ?? null,
  });
});

// GET /api/publish/sites/:id/render — Public: render published HTML document with text/html content-type
publishRouter.get("/sites/:id/render", async (c) => {
  const { id } = c.req.param();
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  let htmlUrl: string | null = null;
  const { data: rpcData, error: rpcError } = await supabase.rpc("get_public_site", { p_site_id: id });
  const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;

  if (!rpcError && row && row.html_url) {
    htmlUrl = row.html_url;
  } else {
    const { data } = await supabase
      .from("websites")
      .select("published_html")
      .eq("id", id)
      .eq("status", "active")
      .maybeSingle();
    htmlUrl = data?.published_html ?? null;
  }

  if (!htmlUrl) {
    return c.json({ error: "Site not found" }, 404);
  }

  const htmlRes = await fetch(htmlUrl);
  if (!htmlRes.ok) {
    return c.json({ error: "Could not fetch published website HTML" }, 502);
  }

  const htmlText = await htmlRes.text();
  return c.html(htmlText, 200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "public, max-age=3600, s-maxage=86400",
  });
});

// POST /api/publish/sites/:id/view — Public: track a page view
publishRouter.post("/sites/:id/view", async (c) => {
  const { id } = c.req.param();
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  await Promise.allSettled([
    supabase.rpc("increment_site_views", { site_id: id }),
    supabase.from("analytics_events").insert({
      site_id: id,
      event_type: "view",
      referrer: c.req.header("Referer") ?? null,
    }),
  ]);

  return c.json({ ok: true });
});

// DELETE /api/publish/sites/:id — Auth: delete website
publishRouter.delete("/sites/:id", authMiddleware, async (c) => {
  const userId = c.get("userId") as string;
  const { id } = c.req.param();
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { error } = await supabase
    .from("websites")
    .update({ status: "deleted" })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return c.json({ error: error.message }, 500);
  return c.body(null, 204);
});

// GET /api/publish/my-sites — Auth: list user's websites
publishRouter.get("/my-sites", authMiddleware, async (c) => {
  const userId = c.get("userId") as string;
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from("websites")
    .select("*")
    .eq("user_id", userId)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data ?? []);
});

// PATCH /api/publish/sites/:id — Auth: update website settings
publishRouter.patch("/sites/:id", authMiddleware, async (c) => {
  const userId = c.get("userId") as string;
  const { id } = c.req.param();
  const body = await c.req.json<{ slug?: string; title?: string; website_type?: string }>();
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  if (body.slug && !/^[a-z0-9-]+$/.test(body.slug)) {
    return c.json({ error: "Invalid slug format" }, 400);
  }

  const { data, error } = await supabase
    .from("websites")
    .update(body)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});
