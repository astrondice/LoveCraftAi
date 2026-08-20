import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { storageService } from "./storage.service";
import { GenerationEngine } from "@/services/generation/engine";
import { renderBlueprint } from "@/lib/renderer/renderer";
import type { PublishInput, PublishResult, PublishProgress, Website } from "@/types";

// ─────────────────────────────────────────────────────────────────
// Deployment history record (public.deployments table)
// ─────────────────────────────────────────────────────────────────
export interface Deployment {
  id: string;
  site_id: string;
  user_id: string;
  version_num: number;
  html_url: string;
  title: string;
  snapshot_json?: Record<string, unknown>;
  created_at: string;
}

const isBrowser = typeof window !== "undefined";

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

// ─────────────────────────────────────────────────────────────────
// Canonical public URL — uses window.location.origin in browser
// so it always matches the actual deployed host.
// ─────────────────────────────────────────────────────────────────
function canonicalUrl(siteId: string): string {
  const origin = isBrowser
    ? window.location.origin
    : import.meta.env.VITE_APP_URL || "https://love-craft-ai.vercel.app";
  return `${origin}/sites/${siteId}`;
}

// ─────────────────────────────────────────────────────────────────
// Normalize raw DB row → Website object.
//
// ACTUAL production columns (verified 2026-08-20):
//   id, user_id, title, slug, website_type, status,
//   blueprint_json, preview_image, published_html,
//   created_at, updated_at, published_at (after migration 012)
//
// Columns that do NOT exist in production:
//   html_url, og_image_url, project_id, is_public,
//   views, unique_visitors, password_hash, version_id
// ─────────────────────────────────────────────────────────────────
function normalizeWebsite(raw: Record<string, unknown>): Website {
  const storageUrl = (raw.published_html as string) || "";
  const imageUrl = (raw.preview_image as string) || null;
  return {
    ...(raw as unknown as Website),
    // html_url is NOT a DB column — populate at runtime for TS consumers
    html_url: storageUrl,
    // og_image_url is NOT a DB column — alias for preview_image
    og_image_url: imageUrl,
    preview_image: imageUrl,
    // published_html is the real DB column
    published_html: storageUrl,
  };
}

// ─────────────────────────────────────────────────────────────────
// Authoritative post-publish verification.
// Checks the DB record exists with renderable content.
// ─────────────────────────────────────────────────────────────────
async function verifyPublishedSite(siteId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { data, error } = await supabase
    .from("websites")
    .select("id, status, blueprint_json, published_html")
    .eq("id", siteId)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) {
    throw new Error(
      "Publish verification failed: website record not found or not active.",
    );
  }

  const hasStorageUrl = Boolean(
    (data.published_html as string | null)?.trim(),
  );
  const bp = data.blueprint_json as Record<string, unknown> | null;
  const hasBlueprint = Boolean(bp && Object.keys(bp).length > 0);

  if (!hasStorageUrl && !hasBlueprint) {
    throw new Error(
      "Publish verification failed: no published HTML and no blueprint.",
    );
  }
}

export const publishService = {
  // ─────────────────────────────────────────────────────────────
  // PUBLISH
  //
  // Insert payload uses ONLY the columns that exist in production:
  //   id, user_id, title, slug, status,
  //   website_type, blueprint_json, preview_image,
  //   published_html, published_at
  // ─────────────────────────────────────────────────────────────
  async publish(
    input: PublishInput,
    userId: string,
    onProgress: (p: PublishProgress) => void,
  ): Promise<PublishResult> {
    const siteId = generateUUID();

    console.log("[Publish] Starting publish pipeline", { siteId, userId });

    // ── Step 1: Upload photos ──────────────────────────────────
    onProgress({ phase: "uploading-assets", percent: 5, message: "Uploading photos…" });

    const projectId = input.projectId ?? siteId; // reuse siteId as projectId if not provided
    const photoUrls: string[] = [];

    for (let i = 0; i < input.photos.length; i++) {
      const photo = input.photos[i];
      const url = await storageService.uploadPhoto(
        userId, projectId, photo.dataUrl, photo.name,
      );
      photoUrls.push(url);
      onProgress({
        phase: "uploading-assets",
        percent: 5 + Math.round(((i + 1) / input.photos.length) * 25),
        message: `Uploading photo ${i + 1} of ${input.photos.length}…`,
      });
    }

    // ── Step 2: Upload audio & video ───────────────────────────
    let musicUrl: string | null = null;
    if (input.music) {
      onProgress({ phase: "uploading-assets", percent: 33, message: "Uploading soundtrack…" });
      musicUrl = await storageService.uploadMedia(
        userId, projectId, input.music.dataUrl, input.music.name, "audio",
      );
    }

    let videoUrl: string | null = null;
    if (input.video) {
      onProgress({ phase: "uploading-assets", percent: 42, message: "Uploading video…" });
      videoUrl = await storageService.uploadMedia(
        userId, projectId, input.video.dataUrl, input.video.name, "video",
      );
    }

    // ── Step 3: Generate blueprint ─────────────────────────────
    onProgress({ phase: "building-html", percent: 50, message: "Crafting your love story…" });

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
      music: musicUrl ? { name: input.music!.name, dataUrl: musicUrl } : input.music,
      video: videoUrl ? { name: input.video!.name, dataUrl: videoUrl } : input.video,
    });

    // ── Step 4: Render HTML ────────────────────────────────────
    const html = renderBlueprint(blueprint);

    // ── Step 5: Upload HTML to public storage bucket ───────────
    onProgress({ phase: "uploading-html", percent: 60, message: "Publishing to the cloud…" });
    const htmlStorageUrl = await storageService.uploadHtml(userId, siteId, html);
    console.log("[Publish] HTML uploaded →", htmlStorageUrl);

    // ── Step 6: Save website record ────────────────────────────
    onProgress({ phase: "saving-record", percent: 72, message: "Saving your story…" });

    const slug = generateSlug(input.name1, input.name2);
    const title = `${input.name1 || "You"} & ${input.name2 || "Them"}`;
    const now = new Date().toISOString();

    let site: Website;

    if (isSupabaseConfigured) {
      // ── IMPORTANT: only columns that ACTUALLY exist in production ──
      const websitePayload = {
        id: siteId,
        user_id: userId,
        title,
        slug,
        status: "active",
        website_type: input.themeId || "cosmic",
        blueprint_json: blueprint as unknown as Record<string, unknown>,
        preview_image: photoUrls[0] || null,
        published_html: htmlStorageUrl,
        published_at: now,
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
        created_at: now,
        updated_at: now,
      };

      site = normalizeWebsite(finalRecord as Record<string, unknown>);
      console.log("[Publish] Website record created:", site.id);

      // Record deployment history — non-blocking, best-effort
      void supabase
        .from("deployments")
        .insert({
          site_id: site.id,
          user_id: userId,
          title: site.title,
          html_url: htmlStorageUrl,
          snapshot_json: blueprint as unknown as Record<string, unknown>,
        })
        .then(({ error }) => {
          if (error) {
            console.warn(
              "[Publish] Deployment history record failed (non-blocking):",
              error.message,
            );
          }
        });
    } else {
      // Local fallback (no Supabase credentials)
      site = {
        id: siteId,
        user_id: userId,
        title,
        slug,
        website_type: input.themeId || "cosmic",
        status: "active",
        blueprint_json: blueprint as unknown as Record<string, unknown>,
        preview_image: photoUrls[0] || null,
        published_html: htmlStorageUrl,
        html_url: htmlStorageUrl,
        og_image_url: photoUrls[0] || null,
        created_at: now,
        updated_at: now,
        published_at: now,
      } as Website;

      if (isBrowser) {
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
          // Storage quota exceeded
        }
      }
    }

    // ── Step 7: Authoritative verification ────────────────────────
    onProgress({ phase: "saving-record", percent: 90, message: "Verifying your website…" });

    try {
      await verifyPublishedSite(siteId);
    } catch (verifyErr) {
      console.error("[Publish] Verification failed:", verifyErr);
      throw verifyErr instanceof Error
        ? verifyErr
        : new Error("Published content could not be verified. Please try again.");
    }

    // ── Step 8: Return canonical URL ──────────────────────────────
    const url = canonicalUrl(siteId);
    onProgress({ phase: "done", percent: 100, message: "Your love story is live! 💖" });
    console.log("[Publish] Complete →", url);

    return { site, url, slug };
  },

  // ─────────────────────────────────────────────────────────────
  // GET SITE — for public viewer (works without auth)
  // ─────────────────────────────────────────────────────────────
  async getSite(
    siteId: string,
  ): Promise<{ site: Website; html: string } | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("websites")
        .select("*")
        .eq("id", siteId)
        .eq("status", "active")
        .maybeSingle();

      if (error || !data) return null;

      const website = normalizeWebsite(data as Record<string, unknown>);
      const storageUrl = website.published_html || website.html_url;

      // Primary: fetch HTML from Supabase Storage (public bucket)
      if (storageUrl) {
        try {
          const res = await fetch(storageUrl);
          if (res.ok) {
            const html = await res.text();
            if (html?.trim()) return { site: website, html };
          }
        } catch (fetchErr) {
          console.warn("[Publish] Storage fetch failed, trying blueprint:", fetchErr);
        }
      }

      // Fallback: render from blueprint_json
      if (website.blueprint_json && Object.keys(website.blueprint_json).length > 0) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const html = renderBlueprint(website.blueprint_json as any);
          return { site: website, html };
        } catch (renderErr) {
          console.error("[Publish] Blueprint fallback render failed:", renderErr);
        }
      }

      return null;
    }

    // Local storage fallback
    const html = isBrowser
      ? sessionStorage.getItem(`lovecraft-site-${siteId}`)
      : null;
    const sites = JSON.parse(
      isBrowser
        ? (localStorage.getItem("lovecraft-published-sites") ?? "[]")
        : "[]",
    ) as Website[];
    const site = sites.find((s) => s.id === siteId);
    if (!site || !html) return null;
    return { site, html };
  },

  // ─────────────────────────────────────────────────────────────
  // GET USER SITES — dashboard list
  // ─────────────────────────────────────────────────────────────
  async getUserSites(): Promise<Website[]> {
    if (isSupabaseConfigured) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("websites")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Publish] getUserSites error:", error.message);
        return [];
      }
      return ((data ?? []) as Record<string, unknown>[]).map(normalizeWebsite);
    }
    return isBrowser
      ? (JSON.parse(
          localStorage.getItem("lovecraft-published-sites") ?? "[]",
        ) as Website[])
      : [];
  },

  // ─────────────────────────────────────────────────────────────
  // REPUBLISH — update existing site, canonical URL stays stable
  // ─────────────────────────────────────────────────────────────
  async republish(
    siteId: string,
    input: PublishInput,
    userId: string,
    onProgress: (p: PublishProgress) => void,
  ): Promise<PublishResult> {
    const projectId = input.projectId ?? siteId;

    onProgress({ phase: "uploading-assets", percent: 5, message: "Uploading updated photos…" });

    const photoUrls: string[] = [];
    for (let i = 0; i < input.photos.length; i++) {
      const url = await storageService.uploadPhoto(
        userId, projectId, input.photos[i].dataUrl, input.photos[i].name,
      );
      photoUrls.push(url);
      onProgress({
        phase: "uploading-assets",
        percent: 5 + Math.round(((i + 1) / input.photos.length) * 25),
        message: `Uploading photo ${i + 1} of ${input.photos.length}…`,
      });
    }

    let musicUrl: string | null = null;
    if (input.music) {
      musicUrl = await storageService.uploadMedia(
        userId, projectId, input.music.dataUrl, input.music.name, "audio",
      );
    }

    let videoUrl: string | null = null;
    if (input.video) {
      videoUrl = await storageService.uploadMedia(
        userId, projectId, input.video.dataUrl, input.video.name, "video",
      );
    }

    onProgress({ phase: "building-html", percent: 50, message: "Crafting your updated story…" });

    const engine = new GenerationEngine();
    const blueprint = await engine.generateBlueprint({
      name1: input.name1, name2: input.name2, message: input.message,
      date: input.date, duration: input.duration, memory: input.memory,
      themeId: input.themeId,
      photos: photoUrls.map((url, i) => ({
        name: input.photos[i]?.name ?? `photo-${i}`, dataUrl: url,
      })),
      music: musicUrl ? { name: input.music!.name, dataUrl: musicUrl } : input.music,
      video: videoUrl ? { name: input.video!.name, dataUrl: videoUrl } : input.video,
    });

    const html = renderBlueprint(blueprint);

    onProgress({ phase: "uploading-html", percent: 60, message: "Republishing to the cloud…" });
    const htmlStorageUrl = await storageService.uploadHtml(userId, siteId, html);

    onProgress({ phase: "saving-record", percent: 72, message: "Updating website record…" });

    const title = `${input.name1 || "You"} & ${input.name2 || "Them"}`;
    const now = new Date().toISOString();
    let site: Website;

    if (isSupabaseConfigured) {
      // Ownership check first
      const { data: existingSite, error: fetchError } = await supabase
        .from("websites")
        .select("id, user_id")
        .eq("id", siteId)
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError || !existingSite) {
        throw new Error("Republish failed: website not found or you do not own it.");
      }

      const { data: updatedData, error: updateError } = await supabase
        .from("websites")
        .update({
          title,
          website_type: input.themeId || "cosmic",
          published_html: htmlStorageUrl,
          preview_image: photoUrls[0] || null,
          blueprint_json: blueprint as unknown as Record<string, unknown>,
          published_at: now,
          updated_at: now,
        })
        .eq("id", siteId)
        .eq("user_id", userId)
        .select()
        .maybeSingle();

      if (updateError || !updatedData) {
        throw new Error(`Republish failed: ${updateError?.message ?? "update failed"}`);
      }

      site = normalizeWebsite(updatedData as Record<string, unknown>);

      void supabase.from("deployments").insert({
        site_id: siteId, user_id: userId, title,
        html_url: htmlStorageUrl,
        snapshot_json: blueprint as unknown as Record<string, unknown>,
      }).then(({ error }) => {
        if (error) console.warn("[Publish] Republish deployment history failed:", error.message);
      });
    } else {
      site = {
        id: siteId, user_id: userId, title, slug: null,
        website_type: input.themeId || "cosmic", status: "active",
        blueprint_json: blueprint as unknown as Record<string, unknown>,
        preview_image: photoUrls[0] || null,
        published_html: htmlStorageUrl, html_url: htmlStorageUrl,
        og_image_url: photoUrls[0] || null,
        created_at: now, updated_at: now, published_at: now,
      } as Website;

      if (isBrowser) {
        try {
          sessionStorage.setItem(`lovecraft-site-${siteId}`, html);
          const sites = JSON.parse(localStorage.getItem("lovecraft-published-sites") ?? "[]") as Website[];
          const idx = sites.findIndex((s) => s.id === siteId);
          if (idx >= 0) sites[idx] = site; else sites.unshift(site);
          localStorage.setItem("lovecraft-published-sites", JSON.stringify(sites.slice(0, 50)));
        } catch { /* quota exceeded */ }
      }
    }

    onProgress({ phase: "saving-record", percent: 90, message: "Verifying republished website…" });
    try {
      await verifyPublishedSite(siteId);
    } catch (verifyErr) {
      throw verifyErr instanceof Error ? verifyErr : new Error("Republished content could not be verified.");
    }

    const url = canonicalUrl(siteId);
    onProgress({ phase: "done", percent: 100, message: "Your love story has been updated! 💖" });
    return { site, url, slug: site.slug ?? null };
  },

  // ─────────────────────────────────────────────────────────────
  // SOFT DELETE (trash)
  // ─────────────────────────────────────────────────────────────
  async deleteSite(siteId: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      let q = supabase.from("websites")
        .update({ status: "trash", updated_at: new Date().toISOString() })
        .eq("id", siteId);
      if (user) q = q.eq("user_id", user.id);
      const { error } = await q;
      if (error) throw new Error(`Failed to delete: ${error.message}`);
      return;
    }
    if (isBrowser) {
      const sites = JSON.parse(localStorage.getItem("lovecraft-published-sites") ?? "[]") as Website[];
      const t = sites.find((s) => s.id === siteId);
      if (t) { t.status = "trash"; localStorage.setItem("lovecraft-published-sites", JSON.stringify(sites)); }
    }
  },

  async getTrashedSites(): Promise<Website[]> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("websites").select("*")
        .eq("user_id", user.id).eq("status", "trash")
        .order("updated_at", { ascending: false });
      return ((data ?? []) as Record<string, unknown>[]).map(normalizeWebsite);
    }
    if (isBrowser) {
      return (JSON.parse(localStorage.getItem("lovecraft-published-sites") ?? "[]") as Website[])
        .filter((s) => s.status === "trash");
    }
    return [];
  },

  async restoreSite(siteId: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      let q = supabase.from("websites")
        .update({ status: "active", updated_at: new Date().toISOString() })
        .eq("id", siteId);
      if (user) q = q.eq("user_id", user.id);
      const { error } = await q;
      if (error) throw new Error(`Failed to restore: ${error.message}`);
      return;
    }
    if (isBrowser) {
      const sites = JSON.parse(localStorage.getItem("lovecraft-published-sites") ?? "[]") as Website[];
      const t = sites.find((s) => s.id === siteId);
      if (t) { t.status = "active"; localStorage.setItem("lovecraft-published-sites", JSON.stringify(sites)); }
    }
  },

  async permanentDeleteSite(siteId: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      let q = supabase.from("websites").delete().eq("id", siteId);
      if (user) q = q.eq("user_id", user.id);
      const { error } = await q;
      if (error) throw new Error(`Failed to delete permanently: ${error.message}`);
      return;
    }
    if (isBrowser) {
      const sites = JSON.parse(localStorage.getItem("lovecraft-published-sites") ?? "[]") as Website[];
      localStorage.setItem("lovecraft-published-sites", JSON.stringify(sites.filter((s) => s.id !== siteId)));
      sessionStorage.removeItem(`lovecraft-site-${siteId}`);
    }
  },

  async getDeployments(siteId: string): Promise<Deployment[]> {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from("deployments").select("*")
        .eq("site_id", siteId).order("created_at", { ascending: false });
      return (data ?? []) as Deployment[];
    }
    return [];
  },

  async rollbackDeployment(siteId: string, deploymentId: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Sign in to rollback.");
    const { data: dep } = await supabase.from("deployments").select("*")
      .eq("id", deploymentId).eq("site_id", siteId).single();
    if (!dep) throw new Error("Deployment not found.");
    const { error } = await supabase.from("websites").update({
      title: dep.title,
      published_html: dep.html_url,
      blueprint_json: dep.snapshot_json,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", siteId).eq("user_id", user.id);
    if (error) throw new Error(`Rollback failed: ${error.message}`);
  },

  async renameSite(siteId: string, newTitle: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      let q = supabase.from("websites")
        .update({ title: newTitle, updated_at: new Date().toISOString() })
        .eq("id", siteId);
      if (user) q = q.eq("user_id", user.id);
      const { error } = await q;
      if (error) throw new Error(`Failed to rename: ${error.message}`);
      return;
    }
    if (isBrowser) {
      const sites = JSON.parse(localStorage.getItem("lovecraft-published-sites") ?? "[]") as Website[];
      const s = sites.find((s) => s.id === siteId);
      if (s) { s.title = newTitle; s.updated_at = new Date().toISOString(); localStorage.setItem("lovecraft-published-sites", JSON.stringify(sites)); }
    }
  },

  async duplicateSite(siteId: string): Promise<Website> {
    const existing = await this.getSite(siteId);
    if (!existing) throw new Error("Site not found.");
    const newSiteId = generateUUID();
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        id: newSiteId,
        user_id: user?.id || existing.site.user_id,
        title: `${existing.site.title} (Copy)`,
        slug: generateSlug(existing.site.title, "copy"),
        website_type: existing.site.website_type || "cosmic",
        status: "active" as const,
        published_html: existing.site.published_html || existing.site.html_url || "",
        preview_image: existing.site.preview_image || null,
        blueprint_json: existing.site.blueprint_json ?? {},
      };
      const { data, error } = await supabase.from("websites").insert(payload).select().single();
      if (error) throw new Error(`Failed to duplicate: ${error.message}`);
      return normalizeWebsite(data as Record<string, unknown>);
    }
    const duplicated: Website = {
      ...existing.site, id: newSiteId,
      title: `${existing.site.title} (Copy)`,
      slug: generateSlug(existing.site.title, "copy"),
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    if (isBrowser) {
      const sites = JSON.parse(localStorage.getItem("lovecraft-published-sites") ?? "[]") as Website[];
      sites.unshift(duplicated);
      localStorage.setItem("lovecraft-published-sites", JSON.stringify(sites));
      sessionStorage.setItem(`lovecraft-site-${newSiteId}`, existing.html);
    }
    return duplicated;
  },

  async trackView(siteId: string): Promise<void> {
    if (isSupabaseConfigured) {
      try { await supabase.rpc("increment_site_views", { site_id: siteId }); } catch { /* non-critical */ }
    }
  },
};
