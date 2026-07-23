// ─────────────────────────────────────────────────────────────────
// Admin API Routes (admin-role only)
// ─────────────────────────────────────────────────────────────────
import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import { adminMiddleware } from "../middleware/auth";
import type { Bindings } from "../index";

export const adminRouter = new Hono<{ Bindings: Bindings }>();

// All admin routes require admin role
adminRouter.use("*", adminMiddleware);

// GET /api/admin/users — List all users
adminRouter.get("/users", async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, role, plan, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// GET /api/admin/sites — List all published sites
adminRouter.get("/sites", async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from("websites")
    .select("*, users(email, name)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// DELETE /api/admin/sites/:id — Force delete a site
adminRouter.delete("/sites/:id", async (c) => {
  const { id } = c.req.param();
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { error } = await supabase
    .from("websites")
    .update({ status: "deleted" })
    .eq("id", id);

  if (error) return c.json({ error: error.message }, 500);
  return c.body(null, 204);
});

// PATCH /api/admin/users/:id/role — Update user role
adminRouter.patch("/users/:id/role", async (c) => {
  const { id } = c.req.param();
  const { role } = await c.req.json<{ role: string }>();
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!["user", "admin", "superadmin"].includes(role)) {
    return c.json({ error: "Invalid role" }, 400);
  }

  const { data, error } = await supabase
    .from("users")
    .update({ role })
    .eq("id", id)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});
