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

// GET /api/publish/sites/:id — Public: fetch website metadata
publishRouter.get("/sites/:id", async (c) => {
  const { id } = c.req.param();
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from("websites")
    .select(
      "id, user_id, title, slug, website_type, status, blueprint_json, preview_image, published_html, created_at, updated_at",
    )
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) return c.json({ error: "Site not found" }, 404);
  return c.json(data);
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
