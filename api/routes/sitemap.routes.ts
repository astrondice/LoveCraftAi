// ─────────────────────────────────────────────────────────────────
// Sitemap API Route — Dynamic XML Sitemap Generator
// GET /api/sitemap.xml
//
// Includes:
//   • Homepage
//   • /templates hub
//   • All published category pages (from CATEGORIES_DATA)
//   • All published templates (status === "published")
//   • Public active user websites (status === "active", is_public !== false)
//
// Excludes:
//   • /login, /signup, /dashboard, /builder, /settings, /analytics
//   • /auth/*, /api/*
//   • Draft, archived, development, review, testing templates
//   • Private or inactive user websites
// ─────────────────────────────────────────────────────────────────
import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import type { Bindings, Variables } from "../index";

// Published categories (slugs only) — keep in sync with CATEGORIES_DATA
const PUBLISHED_CATEGORIES = [
  "love",
  "raksha-bandhan",
  "birthday",
  "wedding",
  "business",
  "portfolio",
  "startup",
  "resume",
  "saas",
  "restaurant",
  "education",
  "festival",
];

// Published templates from templates.data.ts — only status: "published"
const PUBLISHED_TEMPLATES: Array<{ id: string; category: string }> = [
  // Love Collection
  { id: "cosmic", category: "love" },
  { id: "memories", category: "love" },
  { id: "rose", category: "love" },
  { id: "dream", category: "love" },
  { id: "cinematic", category: "love" },
  { id: "proposal", category: "love" },
  { id: "moonlight", category: "love" },
  { id: "golden", category: "love" },
  { id: "sakura", category: "love" },
  { id: "eternal", category: "love" },
  // Raksha Bandhan Collection (published ones only — NOT archived)
  { id: "rakhi-bond", category: "raksha-bandhan" },
  { id: "rakhi-threads", category: "raksha-bandhan" },
  { id: "rakhi-childhood", category: "raksha-bandhan" },
  { id: "rakhi-miles", category: "raksha-bandhan" },
  { id: "rakhi-brother", category: "raksha-bandhan" },
  { id: "rakhi-memories", category: "raksha-bandhan" },
  // NOTE: rakhi-sister and rakhi-promise are "archived" — excluded
];

const SITE_URL = "https://lovecraft.ai";
const TODAY = new Date().toISOString().split("T")[0];

function xmlUrl(
  loc: string,
  opts: { lastmod?: string; changefreq?: string; priority?: string } = {},
): string {
  const lastmod = opts.lastmod ?? TODAY;
  const changefreq = opts.changefreq ?? "weekly";
  const priority = opts.priority ?? "0.7";
  return [
    "  <url>",
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
}

export const sitemapRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

sitemapRouter.get("/sitemap.xml", async (c) => {
  const urls: string[] = [];

  // 1. Homepage
  urls.push(xmlUrl(`${SITE_URL}/`, { changefreq: "daily", priority: "1.0" }));

  // 2. Templates hub
  urls.push(xmlUrl(`${SITE_URL}/templates`, { changefreq: "weekly", priority: "0.9" }));

  // 3. Category pages
  for (const slug of PUBLISHED_CATEGORIES) {
    urls.push(xmlUrl(`${SITE_URL}/templates/${slug}`, { changefreq: "weekly", priority: "0.8" }));
  }

  // 4. Published template pages
  for (const tpl of PUBLISHED_TEMPLATES) {
    urls.push(
      xmlUrl(`${SITE_URL}/templates/${tpl.category}/${tpl.id}`, {
        changefreq: "monthly",
        priority: "0.7",
      }),
    );
  }

  // 5. Public published user websites (from Supabase)
  try {
    if (c.env.SUPABASE_URL && c.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

      // Only include websites that are:
      // - status = "active"
      // - is_public is true or null (not explicitly set to false)
      // - seo_noindex is not true
      const { data: sites } = await supabase
        .from("websites")
        .select("id, updated_at, is_public, seo_noindex")
        .eq("status", "active")
        .neq("is_public", false)
        .neq("seo_noindex", true)
        .order("updated_at", { ascending: false })
        .limit(500); // Safety cap

      if (sites) {
        for (const site of sites) {
          const lastmod = site.updated_at
            ? (site.updated_at as string).split("T")[0]
            : TODAY;
          urls.push(
            xmlUrl(`${SITE_URL}/sites/${site.id}`, {
              lastmod,
              changefreq: "monthly",
              priority: "0.5",
            }),
          );
        }
      }
    }
  } catch (err) {
    // Non-blocking — sitemap still returns static pages if DB fails
    console.error("[Sitemap] Supabase query failed:", err);
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
});
