// ─────────────────────────────────────────────────────────────────
// Storage Service — Upload assets to Supabase Storage
// Falls back to base64 dataURL if Supabase is not configured
// ─────────────────────────────────────────────────────────────────
// FIX: All hardcoded "lovecraft-assets" bucket strings replaced with
//      STORAGE_BUCKETS constants from src/config/storage.ts.
//
// Bucket map (must match Supabase Dashboard → Storage → Buckets):
//   uploads          → photos, audio, video  (private)
//   published-assets → generated HTML sites  (public)
//   thumbnails       → OG preview images     (public)
// ─────────────────────────────────────────────────────────────────
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { STORAGE_BUCKETS, storagePaths } from "@/config/storage";

export interface UploadResult {
  url: string;
  path: string;
}

// ── Helpers ──────────────────────────────────────────────────────

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "application/octet-stream";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function mimeToExt(dataUrl: string): string {
  const mime = dataUrl.match(/data:([^;]+)/)?.[1] ?? "";
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "audio/mpeg": "mp3",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "video/mp4": "mp4",
    "video/webm": "webm",
  };
  return map[mime] ?? "bin";
}

/** Get a public URL from the published-assets or thumbnails bucket */
function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ── Service ──────────────────────────────────────────────────────

export const storageService = {
  /**
   * Upload a photo to the `uploads` bucket.
   * Falls back to the original dataUrl if Supabase is not configured.
   */
  async uploadPhoto(
    userId: string,
    projectId: string,
    dataUrl: string,
    filename: string,
  ): Promise<string> {
    if (!isSupabaseConfigured) return dataUrl;

    const ext = mimeToExt(dataUrl);
    const uniqueName = `${Date.now()}-${filename.replace(/\.[^.]+$/, "")}.${ext}`;
    const path = storagePaths.photo(userId, projectId, uniqueName);
    const blob = dataUrlToBlob(dataUrl);

    console.log(`[Storage] uploadPhoto → bucket="${STORAGE_BUCKETS.uploads}" path="${path}"`);

    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.uploads)
      .upload(path, blob, { contentType: blob.type, upsert: false });

    if (error) {
      console.error(`[Storage] Photo upload failed (bucket="${STORAGE_BUCKETS.uploads}"):`, error.message);
      // Graceful degradation — keep dataUrl in the generated HTML
      return dataUrl;
    }

    // uploads bucket is private — return a signed URL (1 year expiry)
    const { data: signed, error: signErr } = await supabase.storage
      .from(STORAGE_BUCKETS.uploads)
      .createSignedUrl(path, 60 * 60 * 24 * 365);

    if (signErr || !signed?.signedUrl) {
      console.warn("[Storage] Could not create signed URL, falling back to dataUrl");
      return dataUrl;
    }

    return signed.signedUrl;
  },

  /**
   * Upload audio or video to the `uploads` bucket.
   */
  async uploadMedia(
    userId: string,
    projectId: string,
    dataUrl: string,
    filename: string,
    type: "audio" | "video",
  ): Promise<string> {
    if (!isSupabaseConfigured) return dataUrl;

    const ext = mimeToExt(dataUrl);
    const uniqueName = `${Date.now()}-${filename.replace(/\.[^.]+$/, "")}.${ext}`;
    const path = type === "audio"
      ? storagePaths.audio(userId, projectId, uniqueName)
      : storagePaths.video(userId, projectId, uniqueName);
    const blob = dataUrlToBlob(dataUrl);

    console.log(`[Storage] uploadMedia (${type}) → bucket="${STORAGE_BUCKETS.uploads}" path="${path}"`);

    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.uploads)
      .upload(path, blob, { contentType: blob.type, upsert: false });

    if (error) {
      console.error(`[Storage] ${type} upload failed (bucket="${STORAGE_BUCKETS.uploads}"):`, error.message);
      return dataUrl;
    }

    const { data: signed, error: signErr } = await supabase.storage
      .from(STORAGE_BUCKETS.uploads)
      .createSignedUrl(path, 60 * 60 * 24 * 365);

    if (signErr || !signed?.signedUrl) {
      console.warn("[Storage] Could not create signed URL, falling back to dataUrl");
      return dataUrl;
    }

    return signed.signedUrl;
  },

  /**
   * Upload the generated HTML file to the `published-assets` bucket (public).
   * Throws with the actual Supabase error message on failure.
   */
  async uploadHtml(
    userId: string,
    siteId: string,
    html: string,
  ): Promise<string> {
    if (!isSupabaseConfigured) {
      // Return an object URL for same-session preview
      const blob = new Blob([html], { type: "text/html" });
      return URL.createObjectURL(blob);
    }

    const path = storagePaths.html(userId, siteId);
    const blob = new Blob([html], { type: "text/html; charset=utf-8" });

    console.log(`[Storage] uploadHtml → bucket="${STORAGE_BUCKETS.publishedAssets}" path="${path}"`);

    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.publishedAssets)
      .upload(path, blob, {
        contentType: "text/html; charset=utf-8",
        upsert: true, // Allow republishing
      });

    if (error) {
      // Surface the REAL Supabase error — not a generic "Bucket not found"
      console.error(
        `[Storage] HTML upload failed`,
        `bucket="${STORAGE_BUCKETS.publishedAssets}"`,
        `path="${path}"`,
        `error="${error.message}"`,
      );
      throw new Error(
        `HTML upload failed: ${error.message} ` +
        `(bucket="${STORAGE_BUCKETS.publishedAssets}", path="${path}")`,
      );
    }

    const publicUrl = getPublicUrl(STORAGE_BUCKETS.publishedAssets, path);
    console.log("[Storage] HTML uploaded successfully →", publicUrl);
    return publicUrl;
  },

  /**
   * Delete all raw assets for a project from the `uploads` bucket.
   */
  async deleteProjectAssets(
    userId: string,
    projectId: string,
  ): Promise<void> {
    if (!isSupabaseConfigured) return;

    const prefix = `${userId}/${projectId}`;
    console.log(`[Storage] deleteProjectAssets → bucket="${STORAGE_BUCKETS.uploads}" prefix="${prefix}"`);

    const { data } = await supabase.storage
      .from(STORAGE_BUCKETS.uploads)
      .list(prefix, { limit: 1000 });

    if (data && data.length > 0) {
      const paths = data.map((f) => `${prefix}/${f.name}`);
      await supabase.storage.from(STORAGE_BUCKETS.uploads).remove(paths);
    }
  },

  /**
   * Delete the published HTML + any associated assets for a site.
   */
  async deleteSiteAssets(
    userId: string,
    siteId: string,
  ): Promise<void> {
    if (!isSupabaseConfigured) return;

    const htmlPath = storagePaths.html(userId, siteId);
    const thumbPath = storagePaths.thumbnail(userId, siteId);

    await Promise.allSettled([
      supabase.storage.from(STORAGE_BUCKETS.publishedAssets).remove([htmlPath]),
      supabase.storage.from(STORAGE_BUCKETS.thumbnails).remove([thumbPath]),
    ]);
  },
};
