// ─────────────────────────────────────────────────────────────────
// Storage Service — Upload assets to Supabase Storage
// Falls back to base64 dataURL if Supabase not configured
// ─────────────────────────────────────────────────────────────────
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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

export const storageService = {
  /**
   * Upload a photo to Supabase Storage.
   * Falls back to the original dataUrl if Supabase is not configured.
   */
  async uploadPhoto(
    userId: string,
    projectId: string,
    dataUrl: string,
    filename: string,
  ): Promise<string> {
    if (!isSupabaseConfigured) {
      // Graceful degradation — keep using dataUrl
      return dataUrl;
    }

    const ext = mimeToExt(dataUrl);
    const uniqueName = `${Date.now()}-${filename.replace(/\.[^.]+$/, "")}.${ext}`;
    const path = `${userId}/${projectId}/photos/${uniqueName}`;
    const blob = dataUrlToBlob(dataUrl);

    const { error } = await supabase.storage
      .from("lovecraft-assets")
      .upload(path, blob, {
        contentType: blob.type,
        upsert: false,
      });

    if (error) {
      console.error("[Storage] Photo upload failed:", error.message);
      return dataUrl; // fallback
    }

    const { data } = supabase.storage
      .from("lovecraft-assets")
      .getPublicUrl(path);

    return data.publicUrl;
  },

  /**
   * Upload audio/video to Supabase Storage.
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
    const path = `${userId}/${projectId}/${type}/${uniqueName}`;
    const blob = dataUrlToBlob(dataUrl);

    const { error } = await supabase.storage
      .from("lovecraft-assets")
      .upload(path, blob, {
        contentType: blob.type,
        upsert: false,
      });

    if (error) {
      console.error("[Storage] Media upload failed:", error.message);
      return dataUrl;
    }

    const { data } = supabase.storage
      .from("lovecraft-assets")
      .getPublicUrl(path);

    return data.publicUrl;
  },

  /**
   * Upload the generated HTML file to Supabase Storage.
   */
  async uploadHtml(
    userId: string,
    siteId: string,
    html: string,
  ): Promise<string> {
    if (!isSupabaseConfigured) {
      // Return a data URL so the viewer can still work locally
      const blob = new Blob([html], { type: "text/html" });
      return URL.createObjectURL(blob);
    }

    const path = `${userId}/sites/${siteId}/index.html`;
    const blob = new Blob([html], { type: "text/html; charset=utf-8" });

    const { error } = await supabase.storage
      .from("lovecraft-assets")
      .upload(path, blob, {
        contentType: "text/html; charset=utf-8",
        upsert: true, // Allow republishing
      });

    if (error) throw new Error(`HTML upload failed: ${error.message}`);

    const { data } = supabase.storage
      .from("lovecraft-assets")
      .getPublicUrl(path);

    return data.publicUrl;
  },

  /**
   * Delete all assets for a project.
   */
  async deleteProjectAssets(
    userId: string,
    projectId: string,
  ): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { data } = await supabase.storage
      .from("lovecraft-assets")
      .list(`${userId}/${projectId}`, { limit: 1000 });

    if (data && data.length > 0) {
      const paths = data.map((f) => `${userId}/${projectId}/${f.name}`);
      await supabase.storage.from("lovecraft-assets").remove(paths);
    }
  },
};
