// ─────────────────────────────────────────────────────────────────
// Hono API — Cloudflare Worker entry point
// All routes are mounted under /api
// ─────────────────────────────────────────────────────────────────
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

import { projectsRouter } from "./routes/projects.routes";
import { publishRouter } from "./routes/publish.routes";
import { analyticsRouter } from "./routes/analytics.routes";
import { adminRouter } from "./routes/admin.routes";

export type Bindings = {
  // Cloudflare R2
  ASSETS_BUCKET: R2Bucket;
  // Environment secrets
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  R2_PUBLIC_URL: string;
};

export type Variables = {
  userId: string;
  userEmail: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ── Global middleware ────────────────────────────────────────────
app.use("*", logger());
app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return "https://love-craft-ai.vercel.app";
      if (
        origin.endsWith(".vercel.app") ||
        origin === "https://love-craft-ai.vercel.app" ||
        origin === "https://lovecraft.ai" ||
        origin === "https://www.lovecraft.ai" ||
        /^http:\/\/localhost(:\d+)?$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
      ) {
        return origin;
      }
      return "https://love-craft-ai.vercel.app";
    },
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 600,
  }),
);

// ── Health check ─────────────────────────────────────────────────
app.get("/api/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// ── Route groups ─────────────────────────────────────────────────
app.route("/api/projects", projectsRouter);
app.route("/api/publish", publishRouter);
app.route("/api/analytics", analyticsRouter);
app.route("/api/admin", adminRouter);

// ── 404 fallback ─────────────────────────────────────────────────
app.notFound((c) => c.json({ error: "Not found" }, 404));

// ── Error handler ────────────────────────────────────────────────
app.onError((err, c) => {
  console.error("[API Error]", err);
  return c.json({ error: err.message || "Internal server error" }, 500);
});

export default app;
