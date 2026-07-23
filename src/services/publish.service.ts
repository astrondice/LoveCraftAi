// ─────────────────────────────────────────────────────────────────
// Publish Service — Orchestrates the entire publish flow
// Uses exact public.websites schema:
// (id, user_id, title, slug, website_type, status, blueprint_json, preview_image, published_html, created_at, updated_at)
// ─────────────────────────────────────────────────────────────────
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { storageService } from "./storage.service";
import { GenerationEngine } from "@/services/generation/engine";
import { renderBlueprint } from "@/lib/renderer/renderer";
import type {
  PublishInput,
  PublishResult,
  PublishProgress,
  Website,
} from "@/types";

// ── ID generators ─────────────────────────────────────────────────

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function shortId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

function generateSlug(name1: string, name2: string): string {
  const base = `${name1}-${name2}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${base || "love-story"}-${shortId()}`;
}

// ── Service ──────────────────────────────────────────────────────

export const publishService = {
  /**
   * Full publish flow.
   * Reports progress via the onProgress callback.
   */
  async publish(
    input: PublishInput,
    userId: string,
    onProgress: (p: PublishProgress) => void,
  ): Promise<PublishResult> {
    const siteId = generateUUID();
    const projectId = input.projectId ?? generateUUID();

    console.log("[Publish] Starting publish flow", { siteId, projectId, userId });

    // ── Phase 1: Upload photos ──────────────────────────────────
    onProgress({ phase: "uploading-assets", percent: 5, message: "Uploading photos…" });

    const photoUrls: string[] = [];
    for (let i = 0; i < input.photos.length; i++) {
      const photo = input.photos[i];
      const url = await storageService.uploadPhoto(
        userId,
        projectId,
        photo.dataUrl,
        photo.name,
      );
      photoUrls.push(url);
      onProgress({
        phase: "uploading-assets",
        percent: 5 + Math.round(((i + 1) / input.photos.length) * 30),
        message: `Uploading photo ${i + 1} of ${input.photos.length}…`,
      });
    }

    // ── Phase 2: Upload music ───────────────────────────────────
    let musicUrl: string | null = null;
    if (input.music) {
      onProgress({ phase: "uploading-assets", percent: 38, message: "Uploading soundtrack…" });
      musicUrl = await storageService.uploadMedia(
        userId,
        projectId,
        input.music.dataUrl,
        input.music.name,
        "audio",
      );
    }

    // ── Phase 3: Upload video ───────────────────────────────────
    let videoUrl: string | null = null;
    if (input.video) {
      onProgress({ phase: "uploading-assets", percent: 45, message: "Uploading video…" });
      videoUrl = await storageService.uploadMedia(
        userId,
        projectId,
        input.video.dataUrl,
        input.video.name,
        "video",
      );
    }

    // ── Phase 4: Build HTML with permanent URLs ─────────────────
    onProgress({ phase: "building-html", percent: 55, message: "Crafting your love story…" });

    const engine = new GenerationEngine();
    const blueprint = await engine.generateBlueprint({
      name1: input.name1,
      name2: input.name2,
      message: input.message,
      date: input.date,
      duration: input.duration,
      memory: input.memory,
      themeId: input.themeId,
      photos: photoUrls.map((url, i) => ({
        name: input.photos[i]?.name ?? `photo-${i}`,
        dataUrl: url,
      })),
      music: musicUrl
        ? { name: input.music!.name, dataUrl: musicUrl }
        : input.music,
      video: videoUrl
        ? { name: input.video!.name, dataUrl: videoUrl }
        : input.video,
    });

    const html = renderBlueprint(blueprint);

    // ── Phase 5: Upload HTML ────────────────────────────────────
    onProgress({ phase: "uploading-html", percent: 65, message: "Publishing to the cloud…" });
    const htmlUrl = await storageService.uploadHtml(userId, siteId, html);
    console.log("[Publish] HTML uploaded →", htmlUrl);

    // ── Phase 6: Save database record ──────────────────────────
    onProgress({ phase: "saving-record", percent: 80, message: "Saving your site…" });

    const slug = generateSlug(input.name1, input.name2);
    const title = `${input.name1 || "You"} & ${input.name2 || "Them"}`;

    let site: Website;

    if (isSupabaseConfigured) {
      // Save project record if projects table exists
      const { error: projectError } = await supabase.from("projects").upsert({
        id: projectId,
        user_id: userId,
        title,
        name1: input.name1,
        name2: input.name2,
        date: input.date,
        duration: input.duration,
        memory: input.memory,
        message: input.message,
        theme_id: input.themeId,
        photo_urls: photoUrls,
        music_url: musicUrl,
        video_url: videoUrl,
        status: "published",
      });

      if (projectError) {
        console.warn("[Publish] Projects table save skipped/failed:", projectError.message);
      }

      // Payload matching exact public.websites schema:
      // id, user_id, title, slug, website_type, status, blueprint_json, preview_image, published_html
      const websitePayload = {
        id: siteId,
        user_id: userId,
        title,
        slug,
        website_type: input.themeId || "cosmic",
        status: "active",
        blueprint_json: blueprint as unknown as Record<string, unknown>,
        preview_image: photoUrls[0] || null,
        published_html: htmlUrl,
      };

      const { data: siteData, error: siteError } = await supabase
        .from("websites")
        .insert(websitePayload)
        .select()
        .maybeSingle();

      if (siteError) {
        console.error("[Publish] Website insert failed:", siteError.message, siteError.code);
        throw new Error(`Failed to save website: ${siteError.message}`);
      }

      const finalRecord = siteData ?? {
        ...websitePayload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      site = {
        ...finalRecord,
        html_url: finalRecord.published_html,
        og_image_url: finalRecord.preview_image,
      } as Website;

      console.log("[Publish] Website record created:", site.id);
    } else {
      // Local storage fallback when Supabase is not configured
      site = {
        id: siteId,
        user_id: userId,
        title,
        slug,
        website_type: input.themeId || "cosmic",
        status: "active",
        blueprint_json: blueprint as unknown as Record<string, unknown>,
        preview_image: photoUrls[0] || null,
        published_html: htmlUrl,
        html_url: htmlUrl,
        og_image_url: photoUrls[0] || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        sessionStorage.setItem(`lovecraft-site-${siteId}`, html);
        const sites = JSON.parse(
          localStorage.getItem("lovecraft-published-sites") ?? "[]",
        ) as Website[];
        sites.unshift(site);
        localStorage.setItem(
          "lovecraft-published-sites",
          JSON.stringify(sites.slice(0, 50)),
        );
      } catch {
        // Storage quota exceeded — not critical
      }
    }

    const appUrl = import.meta.env.VITE_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
    const url = `${appUrl}/sites/${siteId}`;

    onProgress({ phase: "done", percent: 100, message: "Your love story is live! 💖" });
    console.log("[Publish] Complete →", url);

    return { site, url, slug };
  },

  /** Fetch a website record for the viewer */
  async getSite(siteId: string): Promise<{ site: Website; html: string } | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("websites")
        .select("*")
        .eq("id", siteId)
        .eq("status", "active")
        .maybeSingle();

      if (error || !data) return null;

      const website = {
        ...(data as Website),
        html_url: (data as Website).published_html || (data as Website).html_url,
        og_image_url: (data as Website).preview_image || (data as Website).og_image_url,
      };

      try {
        const res = await fetch(website.published_html || website.html_url!);
        const html = await res.text();
        return { site: website, html };
      } catch {
        return null;
      }
    }

    const html = sessionStorage.getItem(`lovecraft-site-${siteId}`);
    const sites = JSON.parse(
      localStorage.getItem("lovecraft-published-sites") ?? "[]",
    ) as Website[];
    const site = sites.find((s) => s.id === siteId);

    if (!site || !html) return null;
    return { site, html };
  },

  /** Get all websites for the current user */
  async getUserSites(): Promise<Website[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("websites")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Publish] getUserSites error:", error.message);
        return [];
      }
      return ((data ?? []) as Website[]).map((w) => ({
        ...w,
        html_url: w.published_html || w.html_url,
        og_image_url: w.preview_image || w.og_image_url,
      }));
    }
    return JSON.parse(
      localStorage.getItem("lovecraft-published-sites") ?? "[]",
    ) as Website[];
  },

  /** Delete a website record (soft delete) */
  async deleteSite(siteId: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("websites")
        .update({ status: "deleted" })
        .eq("id", siteId);

      if (error) {
        console.error("[Publish] deleteSite error:", error.message);
        throw new Error(`Failed to delete website: ${error.message}`);
      }
      return;
    }
    const sites = JSON.parse(
      localStorage.getItem("lovecraft-published-sites") ?? "[]",
    ) as Website[];
    localStorage.setItem(
      "lovecraft-published-sites",
      JSON.stringify(sites.filter((s) => s.id !== siteId)),
    );
    sessionStorage.removeItem(`lovecraft-site-${siteId}`);
  },

  /** Increment view counter */
  async trackView(siteId: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.rpc("increment_site_views", { site_id: siteId });
      } catch {
        // Ignore if RPC missing
      }
      return;
    }
  },
};
