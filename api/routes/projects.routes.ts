// ─────────────────────────────────────────────────────────────────
// Projects API Routes
// ─────────────────────────────────────────────────────────────────
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../index";

export const projectsRouter = new Hono<AppEnv>();

// All project routes require auth
projectsRouter.use("*", authMiddleware);

const createSchema = z.object({
  title: z.string().min(1).max(200).default("Untitled Love Story"),
  name1: z.string().max(100).default(""),
  name2: z.string().max(100).default(""),
  date: z.string().max(50).default(""),
  duration: z.string().max(100).default(""),
  memory: z.string().max(2000).default(""),
  message: z.string().max(5000).default(""),
  theme_id: z.string().default("cosmic"),
  photo_urls: z.array(z.string().url()).default([]),
  music_url: z.string().url().nullable().default(null),
  video_url: z.string().url().nullable().default(null),
});

const updateSchema = createSchema.partial();

// GET /api/projects
projectsRouter.get("/", async (c) => {
  const userId = c.get("userId") as string;
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      websites (id, slug, title, website_type, preview_image, published_html, status)
    `,
    )
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// GET /api/projects/:id
projectsRouter.get("/:id", async (c) => {
  const userId = c.get("userId") as string;
  const { id } = c.req.param();
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .single();

  if (error || !data) return c.json({ error: "Not found" }, 404);
  return c.json(data);
});

// POST /api/projects
projectsRouter.post("/", zValidator("json", createSchema), async (c) => {
  const userId = c.get("userId") as string;
  const body = c.req.valid("json");
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from("projects")
    .insert({ ...body, user_id: userId })
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

// PATCH /api/projects/:id
projectsRouter.patch("/:id", zValidator("json", updateSchema), async (c) => {
  const userId = c.get("userId") as string;
  const { id } = c.req.param();
  const body = c.req.valid("json");
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from("projects")
    .update(body)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// DELETE /api/projects/:id (soft delete)
projectsRouter.delete("/:id", async (c) => {
  const userId = c.get("userId") as string;
  const { id } = c.req.param();
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { error } = await supabase
    .from("projects")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return c.json({ error: error.message }, 500);
  return c.body(null, 204);
});

// POST /api/projects/:id/duplicate
projectsRouter.post("/:id/duplicate", async (c) => {
  const userId = c.get("userId") as string;
  const { id } = c.req.param();
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: original } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!original) return c.json({ error: "Not found" }, 404);

  const { id: _id, created_at, updated_at, deleted_at, ...fields } = original;
  const { data, error } = await supabase
    .from("projects")
    .insert({ ...fields, title: `${fields.title} (copy)`, status: "draft" })
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

// GET /api/projects/:id/versions
projectsRouter.get("/:id/versions", async (c) => {
  const userId = c.get("userId") as string;
  const { id } = c.req.param();
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  // Verify ownership
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!project) return c.json({ error: "Not found" }, 404);

  const { data, error } = await supabase
    .from("project_versions")
    .select("*")
    .eq("project_id", id)
    .order("version_num", { ascending: false });

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});
