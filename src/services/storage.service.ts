// ─────────────────────────────────────────────────────────────────
// Storage Service — Upload assets to Supabase Storage with isolation,
// security validation, and automatic WebP image compression
// ─────────────────────────────────────────────────────────────────
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { STORAGE_BUCKETS, storagePaths } from "@/config/storage";
import { validateFileSignature } from "@/lib/file-validator";
import { optimizeImage } from "@/lib/media-optimizer";

export interface UploadResult {
  url: string;
  path: string;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "application/octet-stream";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function mimeToExt(mimeOrDataUrl: string): string {
  const mime = mimeOrDataUrl.includes(";")
    ? (mimeOrDataUrl.match(/data:([^;]+)/)?.[1] ?? "")
    : mimeOrDataUrl;

  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "audio/m4a": "m4a",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "application/pdf": "pdf",
  };
  return map[mime] ?? "bin";
}

function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export const storageService = {
  /**
   * Upload a photo to the `uploads` bucket under `users/{userId}/images/`.
   * Automatically validates file signature, strips EXIF metadata, and converts to WebP.
   */
  async uploadPhoto(
    userId: string,
    projectId: string,
    dataUrl: string,
    filename: string,
  ): Promise<string> {
    if (!isSupabaseConfigured) return dataUrl;

    const rawBlob = dataUrlToBlob(dataUrl);

    // 1. File security validation
    const validation = await validateFileSignature(rawBlob, filename);
    if (!validation.valid) {
      console.warn(`[Storage] Photo validation warning for ${filename}:`, validation.error);
    }

    // 2. Optimize image (convert to WebP, strip EXIF, downscale if >2048px)
    let finalBlob: Blob = rawBlob;
    let ext = mimeToExt(rawBlob.type);

    try {
      const optimized = await optimizeImage(dataUrl);
      finalBlob = optimized.blob;
      ext = optimized.format === "webp" ? "webp" : ext;
      console.log(
        `[Storage] Image optimized: ${filename} (${(optimized.originalSizeBytes / 1024).toFixed(1)}KB -> ${(optimized.optimizedSizeBytes / 1024).toFixed(1)}KB WebP)`,
      );
    } catch (optErr) {
      console.warn("[Storage] Image optimization fallback to raw blob:", optErr);
    }

    const uniqueName = `${Date.now()}-${filename.replace(/\.[^.]+$/, "")}.${ext}`;
    const path = storagePaths.photo(userId, projectId, uniqueName);

    console.log(`[Storage] uploadPhoto → bucket="${STORAGE_BUCKETS.uploads}" path="${path}"`);

    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.uploads)
      .upload(path, finalBlob, { contentType: finalBlob.type, upsert: false });

    if (error) {
      console.error(
        `[Storage] Photo upload failed (bucket="${STORAGE_BUCKETS.uploads}"):`,
        error.message,
      );
      return dataUrl;
    }

    // Return signed URL (1 year expiry)
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
   * Upload audio or video to the `uploads` bucket under `users/{userId}/audio/` or `users/{userId}/videos/`.
   */
  async uploadMedia(
    userId: string,
    projectId: string,
    dataUrl: string,
    filename: string,
    type: "audio" | "video",
  ): Promise<string> {
    if (!isSupabaseConfigured) return dataUrl;

    const blob = dataUrlToBlob(dataUrl);

    // File security validation
    const validation = await validateFileSignature(blob, filename);
    if (!validation.valid) {
      console.warn(`[Storage] ${type} validation warning for ${filename}:`, validation.error);
    }

    const ext = mimeToExt(blob.type);
    const uniqueName = `${Date.now()}-${filename.replace(/\.[^.]+$/, "")}.${ext}`;
    const path =
      type === "audio"
        ? storagePaths.audio(userId, projectId, uniqueName)
        : storagePaths.video(userId, projectId, uniqueName);

    console.log(
      `[Storage] uploadMedia (${type}) → bucket="${STORAGE_BUCKETS.uploads}" path="${path}"`,
    );

    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.uploads)
      .upload(path, blob, { contentType: blob.type, upsert: false });

    if (error) {
      console.error(
        `[Storage] ${type} upload failed (bucket="${STORAGE_BUCKETS.uploads}"):`,
        error.message,
      );
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
   * Upload the generated HTML file to the `published-assets` bucket under `users/{userId}/sites/{siteId}/index.html`.
   */
  async uploadHtml(userId: string, siteId: string, html: string): Promise<string> {
    if (!isSupabaseConfigured) {
      const blob = new Blob([html], { type: "text/html" });
      return URL.createObjectURL(blob);
    }

    const path = storagePaths.html(userId, siteId);
    const blob = new Blob([html], { type: "text/html; charset=utf-8" });

    console.log(
      `[Storage] uploadHtml → bucket="${STORAGE_BUCKETS.publishedAssets}" path="${path}"`,
    );

    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.publishedAssets)
      .upload(path, blob, {
        contentType: "text/html; charset=utf-8",
        upsert: true,
      });

    if (error) {
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
   * Delete project assets.
   */
  async deleteProjectAssets(userId: string, projectId: string): Promise<void> {
    if (!isSupabaseConfigured) return;

    const prefix = `users/${userId}`;
    console.log(
      `[Storage] deleteProjectAssets → bucket="${STORAGE_BUCKETS.uploads}" prefix="${prefix}"`,
    );

    const { data } = await supabase.storage
      .from(STORAGE_BUCKETS.uploads)
      .list(prefix, { limit: 1000 });

    if (data && data.length > 0) {
      const paths = data.map((f) => `${prefix}/${f.name}`);
      await supabase.storage.from(STORAGE_BUCKETS.uploads).remove(paths);
    }
  },

  /**
   * Delete site assets.
   */
  async deleteSiteAssets(userId: string, siteId: string): Promise<void> {
    if (!isSupabaseConfigured) return;

    const htmlPath = storagePaths.html(userId, siteId);
    const thumbPath = storagePaths.thumbnail(userId, siteId);

    await Promise.allSettled([
      supabase.storage.from(STORAGE_BUCKETS.publishedAssets).remove([htmlPath]),
      supabase.storage.from(STORAGE_BUCKETS.thumbnails).remove([thumbPath]),
    ]);
  },
};
