// ─────────────────────────────────────────────────────────────────
// Storage Configuration — Single source of truth for bucket names
// ─────────────────────────────────────────────────────────────────
// These MUST match the bucket names created in your Supabase project.
// Supabase Dashboard → Storage → Buckets
//
// Bucket layout:
//   uploads          — user-uploaded photos, audio, video (private)
//   published-assets — generated HTML love sites (public)
//   thumbnails       — generated OG/preview images (public)
// ─────────────────────────────────────────────────────────────────

export const STORAGE_BUCKETS = {
  /** User-uploaded raw assets: photos, audio, video. Private bucket. */
  uploads: "uploads",

  /** Generated HTML love sites served publicly. Public bucket. */
  publishedAssets: "published-assets",

  /** OG / preview thumbnails. Public bucket. */
  thumbnails: "thumbnails",
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

/**
 * Path helpers — keep path conventions consistent across all upload calls.
 */
export const storagePaths = {
  image: (userId: string, filename: string, projectId?: string) =>
    projectId
      ? `users/${userId}/images/${projectId}/${filename}`
      : `users/${userId}/images/${filename}`,

  photo: (userId: string, projectId: string, filename: string) =>
    `users/${userId}/images/${projectId}/${filename}`,

  audio: (userId: string, projectId: string, filename: string) =>
    `users/${userId}/audio/${projectId}/${filename}`,

  video: (userId: string, projectId: string, filename: string) =>
    `users/${userId}/videos/${projectId}/${filename}`,

  asset: (userId: string, filename: string) =>
    `users/${userId}/assets/${filename}`,

  html: (userId: string, siteId: string) => `users/${userId}/sites/${siteId}/index.html`,

  thumbnail: (userId: string, siteId: string) => `users/${userId}/sites/${siteId}/thumbnail.jpg`,
} as const;
