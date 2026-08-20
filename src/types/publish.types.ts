// ─────────────────────────────────────────────────────────────────
// Publish Types — aligned with the ACTUAL production Supabase schema.
//
// KEY FACTS (verified by running migration 012):
//   - The production `websites` table does NOT have `html_url`.
//   - The canonical storage URL column is `published_html`.
//   - `html_url` is populated at runtime by normalizeWebsite() in
//     publish.service.ts for TypeScript consumer convenience but
//     is NOT a real DB column in production.
// ─────────────────────────────────────────────────────────────────

export type SiteStatus = "active" | "inactive" | "deleted" | "trash";

/**
 * Website record from public.websites.
 *
 * Column names match the actual production DB schema.
 * `html_url` is NOT in the DB — it's a client-side normalized
 * alias for `published_html`, populated by normalizeWebsite().
 */
export interface Website {
  // ── Core identifiers ──────────────────────────────────────────
  id: string;
  user_id: string;
  /** FK to projects table. Required in DB (NOT NULL). */
  project_id?: string;
  version_id?: string | null;

  // ── Content ──────────────────────────────────────────────────
  title: string;
  slug: string | null;

  // ── Status & visibility ───────────────────────────────────────
  status: SiteStatus;
  is_public?: boolean;

  // ── Theme ─────────────────────────────────────────────────────
  /** Theme identifier e.g. 'cosmic', 'sakura'. Added migration 012. */
  website_type?: string | null;

  // ── Published content ─────────────────────────────────────────
  /**
   * Canonical storage URL for the published HTML file.
   * This IS a real DB column in production.
   * Primary column — always populated on a live published site.
   */
  published_html?: string;

  /**
   * Client-side alias for published_html.
   * NOT a real DB column in production — populated by normalizeWebsite().
   * Always equals published_html at runtime.
   */
  html_url?: string;

  /**
   * Blueprint JSON for fallback client-side rendering.
   * Added in migration 012.
   */
  blueprint_json?: Record<string, unknown> | null;

  // ── Media ─────────────────────────────────────────────────────
  /** OG image URL — real DB column. */
  og_image_url?: string | null;
  /** Alias for og_image_url. Added in migration 012. */
  preview_image?: string | null;

  // ── Analytics ─────────────────────────────────────────────────
  views?: number;
  unique_visitors?: number;

  // ── Timestamps ───────────────────────────────────────────────
  created_at: string;
  updated_at: string;
  /** When the website was last published. Added in migration 012. */
  published_at?: string | null;

  // ── Security ─────────────────────────────────────────────────
  password_hash?: string | null;
}

export type PublishedSite = Website;

export type PublishPhase =
  | "idle"
  | "uploading-assets"
  | "building-html"
  | "uploading-html"
  | "saving-record"
  | "done"
  | "error";

export interface PublishProgress {
  phase: PublishPhase;
  percent: number;
  message: string;
}

export interface PublishResult {
  site: Website;
  /** Canonical public URL: https://{host}/sites/{siteId} */
  url: string;
  slug: string | null;
}

export interface PublishInput {
  projectId?: string;
  name1: string;
  name2: string;
  date: string;
  duration: string;
  memory: string;
  message: string;
  themeId: string;
  photos: Array<{ name: string; dataUrl: string }>;
  music: { name: string; dataUrl: string } | null;
  video: { name: string; dataUrl: string } | null;
}

export interface Asset {
  id: string;
  user_id: string;
  project_id: string | null;
  type: "image" | "video" | "audio" | "html" | "zip" | "thumbnail";
  filename: string;
  r2_key: string;
  url: string;
  size_bytes: number | null;
  mime_type: string | null;
  created_at: string;
}
