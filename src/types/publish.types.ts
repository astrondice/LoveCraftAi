// ─────────────────────────────────────────────────────────────────
// Publish Types
// ─────────────────────────────────────────────────────────────────

export type SiteStatus = "active" | "inactive" | "deleted";

export interface PublishedSite {
  id: string;
  project_id: string;
  user_id: string;
  version_id: string | null;
  slug: string | null;
  title: string;
  html_url: string;
  og_image_url: string | null;
  is_public: boolean;
  password_hash: string | null;
  views: number;
  unique_visitors: number;
  status: SiteStatus;
  created_at: string;
  updated_at: string;
}

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
  site: PublishedSite;
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
