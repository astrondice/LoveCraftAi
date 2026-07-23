// ─────────────────────────────────────────────────────────────────
// Publish Types — Aligned with public.websites schema
// ─────────────────────────────────────────────────────────────────

export type SiteStatus = "active" | "inactive" | "deleted";

export interface Website {
  id: string;
  user_id: string;
  title: string;
  slug: string | null;
  website_type: string | null;
  status: SiteStatus;
  blueprint_json: Record<string, unknown> | null;
  preview_image: string | null;
  published_html: string;
  created_at: string;
  updated_at: string;

  // Optional alias getters for backward compatibility
  project_id?: string;
  html_url?: string;
  og_image_url?: string | null;
  views?: number;
  unique_visitors?: number;
  is_public?: boolean;
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
  url: string;   // https://lovecraft.ai/sites/{id}
  slug: string | null;
}

export interface PublishInput {
  projectId?: string;       // existing project ID if updating
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
