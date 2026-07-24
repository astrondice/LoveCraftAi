// ─────────────────────────────────────────────────────────────────
// Project Types
// ─────────────────────────────────────────────────────────────────

export type ProjectStatus = "draft" | "published" | "archived";
export type ThemeId = "cosmic" | "memories" | "rose" | "dream" | "cinematic" | "proposal";

export interface PhotoAsset {
  name: string;
  dataUrl: string; // local preview (base64)
  url?: string; // Supabase Storage URL after upload
}

export interface MediaAsset {
  name: string;
  dataUrl: string; // local preview
  url?: string; // Supabase Storage URL after upload
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  slug: string | null;
  status: ProjectStatus;
  is_favorite: boolean;
  thumbnail_url: string | null;
  // Story
  name1: string;
  name2: string;
  date: string;
  duration: string;
  memory: string;
  message: string;
  theme_id: ThemeId;
  // Assets (URLs after upload)
  photo_urls: string[];
  music_url: string | null;
  video_url: string | null;
  // Timestamps
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProjectVersion {
  id: string;
  project_id: string;
  version_num: number;
  html_url: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type CreateProjectInput = Omit<
  Project,
  "id" | "user_id" | "created_at" | "updated_at" | "deleted_at"
>;

export type UpdateProjectInput = Partial<CreateProjectInput>;

export interface ProjectListItem extends Project {
  published_site?: {
    id: string;
    slug: string | null;
    views: number;
    status: string;
  } | null;
}
