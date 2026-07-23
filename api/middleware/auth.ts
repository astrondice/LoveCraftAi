// ─────────────────────────────────────────────────────────────────
// Auth Middleware — Verify Supabase JWT on protected routes
// ─────────────────────────────────────────────────────────────────
import type { Context, Next } from "hono";
import { createClient } from "@supabase/supabase-js";

export async function authMiddleware(c: Context, next: Next) {
  const authorization = c.req.header("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authorization.slice(7);
  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }

  // Attach user to context
  c.set("userId", user.id);
  c.set("userEmail", user.email ?? "");

  await next();
}

/** Admin-only middleware (requires role = 'admin') */
export async function adminMiddleware(c: Context, next: Next) {
  await authMiddleware(c, async () => {});

  const userId = c.get("userId") as string | undefined;
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (!data || !["admin", "superadmin"].includes(data.role)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  await next();
}
