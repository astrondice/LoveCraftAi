// ─────────────────────────────────────────────────────────────────
// Publish Service — Orchestrates the entire publish flow
// ─────────────────────────────────────────────────────────────────
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { storageService } from "./storage.service";
import { GenerationEngine } from "@/services/generation/engine";
import { renderBlueprint } from "@/lib/renderer/renderer";
import type {
  PublishInput,
  PublishResult,
  PublishProgress,
  PublishedSite,
} from "@/types";

// Generate a nanoid-style unique ID (7 chars, URL-safe)
function generateId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length: 7 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

// Derive a URL-safe slug from names
function generateSlug(name1: string, name2: string): string {
  const combined = `${name1}-${name2}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  return combined || `love-story-${generateId()}`;
}

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
    const siteId = generateId();
    const projectId = input.projectId ?? generateId();

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
      // Use permanent URLs if available, else keep dataUrls
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

    // ── Phase 6: Save database record ──────────────────────────
    onProgress({ phase: "saving-record", percent: 80, message: "Saving your site…" });

    const slug = generateSlug(input.name1, input.name2);
    const title = `${input.name1 || "You"} & ${input.name2 || "Them"}`;

    let site: PublishedSite;

    if (isSupabaseConfigured) {
      // Upsert project record
      await supabase.from("projects").upsert({
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

      // Create published site
      const { data: siteData, error: siteError } = await supabase
        .from("published_sites")
        .upsert({
          id: siteId,
          project_id: projectId,
          user_id: userId,
          title,
          slug,
          html_url: htmlUrl,
          is_public: true,
          status: "active",
          views: 0,
        })
        .select()
        .single();

      if (siteError || !siteData) {
        throw new Error(siteError?.message ?? "Failed to save site");
      }

      site = siteData as PublishedSite;
    } else {
      // Graceful degradation — save to localStorage
      site = {
        id: siteId,
        project_id: projectId,
        user_id: userId,
        version_id: null,
        slug,
        title,
        html_url: htmlUrl,
        og_image_url: null,
        is_public: true,
        password_hash: null,
        views: 0,
        unique_visitors: 0,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      // Store the HTML in sessionStorage for same-session viewing
      try {
        sessionStorage.setItem(`lovecraft-site-${siteId}`, html);
        const sites = JSON.parse(
          localStorage.getItem("lovecraft-published-sites") ?? "[]",
        ) as PublishedSite[];
        sites.unshift(site);
        localStorage.setItem(
          "lovecraft-published-sites",
          JSON.stringify(sites.slice(0, 50)),
        );
      } catch {
        // Storage quota exceeded — not critical
      }
    }

    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const url = `${appUrl}/sites/${siteId}`;

    onProgress({ phase: "done", percent: 100, message: "Your love story is live! 💖" });

    return { site, url, slug };
  },

  /** Fetch a published site for the viewer */
  async getSite(siteId: string): Promise<{ site: PublishedSite; html: string } | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("published_sites")
        .select("*")
        .eq("id", siteId)
        .eq("status", "active")
        .single();

      if (error || !data) return null;

      // Fetch the HTML from storage
      try {
        const res = await fetch((data as PublishedSite).html_url);
        const html = await res.text();
        return { site: data as PublishedSite, html };
      } catch {
        return null;
      }
    }

    // localStorage fallback
    const html = sessionStorage.getItem(`lovecraft-site-${siteId}`);
    const sites = JSON.parse(
      localStorage.getItem("lovecraft-published-sites") ?? "[]",
    ) as PublishedSite[];
    const site = sites.find((s) => s.id === siteId);

    if (!site || !html) return null;
    return { site, html };
  },

  /** Get all sites for the current user (from localStorage fallback) */
  async getUserSites(): Promise<PublishedSite[]> {
    if (isSupabaseConfigured) {
      const { data } = await supabase
        .from("published_sites")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      return (data ?? []) as PublishedSite[];
    }
    return JSON.parse(
      localStorage.getItem("lovecraft-published-sites") ?? "[]",
    ) as PublishedSite[];
  },

  /** Delete a published site */
  async deleteSite(siteId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from("published_sites")
        .update({ status: "deleted" })
        .eq("id", siteId);
      return;
    }
    const sites = JSON.parse(
      localStorage.getItem("lovecraft-published-sites") ?? "[]",
    ) as PublishedSite[];
    localStorage.setItem(
      "lovecraft-published-sites",
      JSON.stringify(sites.filter((s) => s.id !== siteId)),
    );
    sessionStorage.removeItem(`lovecraft-site-${siteId}`);
  },

  /** Increment view counter */
  async trackView(siteId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.rpc("increment_site_views", { site_id: siteId });
      return;
    }
    const sites = JSON.parse(
      localStorage.getItem("lovecraft-published-sites") ?? "[]",
    ) as PublishedSite[];
    const site = sites.find((s) => s.id === siteId);
    if (site) {
      site.views = (site.views ?? 0) + 1;
      localStorage.setItem("lovecraft-published-sites", JSON.stringify(sites));
    }
  },
};
