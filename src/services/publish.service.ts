import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { storageService } from "./storage.service";
import { GenerationEngine } from "@/services/generation/engine";
import { renderBlueprint } from "@/lib/renderer/renderer";
import type { PublishInput, PublishResult, PublishProgress, Website } from "@/types";

export interface Deployment { id: string; site_id: string; version_num: number; html_url: string; title: string; created_at: string; status?: "pending" | "active" | "failed"; }
export type PublicSite = { id: string; title: string; website_type?: string | null; preview_image?: string | null; published_at?: string | null; html_url: string; status: "active"; is_public: true };
const PUBLIC_ORIGIN = (typeof import.meta !== "undefined" && import.meta.env?.VITE_PUBLIC_APP_URL) || (typeof process !== "undefined" ? process.env.VITE_PUBLIC_APP_URL : "") || "https://love-craft-ai.vercel.app";
const newId = () => crypto.randomUUID();
const requireConfigured = () => { if (!isSupabaseConfigured) throw new Error("Publishing requires configured Supabase credentials."); };
const asWebsite = (row: Record<string, unknown>): Website => ({ ...(row as unknown as Website), html_url: (row.published_html as string) || undefined });
function siteSlug(a: string, b: string) { const v = `${a}-${b}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40); return `${v || "love-story"}-${Math.random().toString(36).slice(2, 8)}`; }
async function hash(value: string) { const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)); return Array.from(new Uint8Array(d), b => b.toString(16).padStart(2, "0")).join(""); }
async function requireUser(userId: string) { const { data: { user } } = await supabase.auth.getUser(); if (!user || user.id !== userId) throw new Error("Your session is missing or expired. Please sign in again."); }

import { createServerFn } from "@tanstack/react-start";

export const getPublicSiteServerFn = createServerFn({ method: "GET" })
  .validator((siteId: string) => siteId)
  .handler(async ({ data: siteId }) => {
    if (!siteId) return null;

    const supabaseUrl =
      (typeof process !== "undefined" ? process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL : "") ||
      "https://oucygqsltknoderruayc.supabase.co";
    const supabaseServiceKey =
      (typeof process !== "undefined" ? process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY : "") ||
      "sb_publishable_p-koiNrSnQV6QsL3GLr-DA_ApR6VEI5";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Try public RPC get_public_site first
    const { data: rpcData, error: rpcErr } = await supabase.rpc("get_public_site", { p_site_id: siteId });
    const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;

    if (!rpcErr && row && row.html_url) {
      return {
        id: row.id,
        title: row.title ?? "A Beautiful Memory",
        website_type: row.website_type ?? null,
        preview_image: row.preview_image ?? null,
        html_url: row.html_url,
        published_at: row.published_at ?? null,
      };
    }

    // 2. Server-side SELECT selecting ONLY safe public columns for active website record
    const { data, error } = await supabase
      .from("websites")
      .select("id, title, website_type, status, preview_image, published_html, published_at")
      .eq("id", siteId)
      .eq("status", "active")
      .maybeSingle();

    if (error || !data || !data.published_html) {
      return null;
    }

    return {
      id: data.id,
      title: data.title ?? "A Beautiful Memory",
      website_type: data.website_type ?? null,
      preview_image: data.preview_image ?? null,
      html_url: data.published_html,
      published_at: data.published_at ?? null,
    };
  });

export const getPublicSiteRenderServerFn = createServerFn({ method: "GET" })
  .validator((siteId: string) => siteId)
  .handler(async ({ data: siteId }) => {
    if (!siteId) return null;

    const supabaseUrl =
      (typeof process !== "undefined" ? process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL : "") ||
      "https://oucygqsltknoderruayc.supabase.co";
    const supabaseServiceKey =
      (typeof process !== "undefined" ? process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY : "") ||
      "sb_publishable_p-koiNrSnQV6QsL3GLr-DA_ApR6VEI5";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let htmlUrl: string | null = null;
    const { data: rpcData, error: rpcErr } = await supabase.rpc("get_public_site", { p_site_id: siteId });
    const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;

    if (!rpcErr && row && row.html_url) {
      htmlUrl = row.html_url;
    } else {
      const { data } = await supabase
        .from("websites")
        .select("published_html")
        .eq("id", siteId)
        .eq("status", "active")
        .maybeSingle();
      htmlUrl = data?.published_html ?? null;
    }

    if (!htmlUrl) return null;

    try {
      const res = await fetch(htmlUrl);
      if (!res.ok) return null;
      const html = await res.text();
      return { html, htmlUrl };
    } catch {
      return null;
    }
  });

export const publishService = {
  async publish(input: PublishInput, userId: string, progress: (p: PublishProgress) => void): Promise<PublishResult> { return this.publishVersion(undefined, input, userId, progress); },
  async republish(siteId: string, input: PublishInput, userId: string, progress: (p: PublishProgress) => void): Promise<PublishResult> { return this.publishVersion(siteId, input, userId, progress); },

  async publishVersion(existingId: string | undefined, input: PublishInput, userId: string, progress: (p: PublishProgress) => void): Promise<PublishResult> {
    requireConfigured(); await requireUser(userId);
    if (input.projectId) {
      const { data: project, error } = await supabase.from("projects").select("id").eq("id", input.projectId).eq("user_id", userId).is("deleted_at", null).maybeSingle();
      if (error || !project) throw new Error("Project not found or you do not own it.");
    }
    const siteId = existingId || newId();
    const title = `${input.name1 || "You"} & ${input.name2 || "Them"}`;
    let created = false;
    if (!existingId) {
      const { error } = await supabase.from("websites").insert({ id: siteId, user_id: userId, title, slug: siteSlug(input.name1, input.name2), status: "inactive", website_type: input.themeId || "cosmic", blueprint_json: {}, published_html: "" });
      if (error) throw new Error(`Could not create website: ${error.message}`);
      created = true;
    }
    // 1. Attempt creating immutable published version via RPC
    let version: { id: string; version_number: number } | null = null;
    try {
      const { data: versionRows, error: versionError } = await supabase.rpc("create_pending_published_version", { p_site_id: siteId });
      if (!versionError && versionRows) {
        version = Array.isArray(versionRows) ? versionRows[0] : versionRows;
      }
    } catch {
      // Fallback to direct publishing if RPC is not present
    }

    try {
      progress({ phase: "uploading-assets", percent: 10, message: "Finalizing permanent assets…" });
      const versionId = version?.id || newId();
      const photos = await Promise.all(
        input.photos.map((p) => storageService.uploadPublishedAsset(siteId, versionId, "images", p.dataUrl, p.name))
      );
      const music = input.music
        ? await storageService.uploadPublishedAsset(siteId, versionId, "audio", input.music.dataUrl, input.music.name)
        : null;
      const video = input.video
        ? await storageService.uploadPublishedAsset(siteId, versionId, "videos", input.video.dataUrl, input.video.name)
        : null;

      progress({ phase: "building-html", percent: 48, message: "Building your published version…" });
      const blueprint = await new GenerationEngine().generateBlueprint({
        ...input,
        photos: photos.map((url, i) => ({ name: input.photos[i]?.name || `photo-${i}`, dataUrl: url })),
        music: music ? { name: input.music!.name, dataUrl: music } : null,
        video: video ? { name: input.video!.name, dataUrl: video } : null,
      });
      const html = renderBlueprint(blueprint);
      const contentHash = await hash(html);

      progress({ phase: "uploading-html", percent: 70, message: "Publishing version…" });
      const htmlUrl = version
        ? await storageService.uploadPublishedHtml(siteId, version.id, html)
        : await storageService.uploadHtml(userId, siteId, html);

      const checked = await fetch(htmlUrl);
      if (!checked.ok || !(await checked.text()).trim()) {
        throw new Error("Published HTML verification failed.");
      }

      progress({ phase: "saving-record", percent: 88, message: "Activating published version…" });
      if (version) {
        const { error: activateError } = await supabase.rpc("activate_published_version", {
          p_site_id: siteId,
          p_version_id: version.id,
          p_html_path: htmlUrl,
          p_preview_image: photos[0] || null,
          p_content_hash: contentHash,
          p_title: title,
          p_website_type: input.themeId || "cosmic",
          p_blueprint: blueprint,
        });
        if (activateError) throw new Error(`Could not activate published version: ${activateError.message}`);
      } else {
        const { error: updateError } = await supabase
          .from("websites")
          .update({
            status: "active",
            title,
            website_type: input.themeId || "cosmic",
            preview_image: photos[0] || null,
            published_html: htmlUrl,
            blueprint_json: blueprint,
            published_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", siteId)
          .eq("user_id", userId);
        if (updateError) throw new Error(`Could not activate published website: ${updateError.message}`);
      }

      const { data, error } = await supabase.from("websites").select("*").eq("id", siteId).single();
      if (error || !data) throw new Error(`Published website was activated but could not be read: ${error?.message || "unknown error"}`);

      progress({ phase: "done", percent: 100, message: "Your love story is live!" });
      return { site: asWebsite(data as Record<string, unknown>), url: `${PUBLIC_ORIGIN}/sites/${siteId}`, slug: (data as Website).slug };
    } catch (error) {
      if (version) {
        await storageService.deletePendingPublishedVersion(siteId, version.id);
        await supabase.rpc("fail_published_version", { p_site_id: siteId, p_version_id: version.id });
      }
      if (created) await supabase.from("websites").delete().eq("id", siteId).eq("user_id", userId);
      throw error;
    }
  },

  async getSiteHtml(siteId: string): Promise<{ html: string; site: PublicSite; htmlUrl: string } | null> {
    const result = await this.getSite(siteId);
    if (!result || !result.htmlUrl) return null;

    try {
      const res = await fetch(result.htmlUrl);
      if (!res.ok) return null;
      const html = await res.text();
      return { html, site: result.site, htmlUrl: result.htmlUrl };
    } catch {
      return null;
    }
  },

  async getSite(siteId: string): Promise<{ site: PublicSite; htmlUrl: string } | null> {
    if (!siteId) return null;

    // 1. Primary path: Call get_public_site RPC (granted to anon + authenticated)
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc("get_public_site", { p_site_id: siteId });
        const row = Array.isArray(data) ? data[0] : data;
        if (!error && row && row.html_url) {
          const publicSite: PublicSite = {
            id: row.id,
            title: row.title ?? "A Beautiful Memory",
            website_type: row.website_type ?? null,
            preview_image: row.preview_image ?? null,
            published_at: row.published_at ?? null,
            html_url: row.html_url,
            status: "active",
            is_public: true,
          };
          return { site: publicSite, htmlUrl: row.html_url };
        }
      } catch {
        // Fallback to server function / direct query below
      }
    }

    // 2. Secondary path: Controlled public Server Function / API endpoint
    try {
      const data = await getPublicSiteServerFn({ data: siteId });
      if (data && data.html_url) {
        const publicSite: PublicSite = {
          id: data.id,
          title: data.title ?? "A Beautiful Memory",
          website_type: data.website_type ?? null,
          preview_image: data.preview_image ?? null,
          published_at: data.published_at ?? null,
          html_url: data.html_url,
          status: "active",
          is_public: true,
        };
        return { site: publicSite, htmlUrl: data.html_url };
      }
    } catch {
      // Fallback to safe direct query below
    }

    // 3. Client Fallback: Query active website record selecting strictly safe public columns
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("websites")
          .select("id, title, website_type, status, preview_image, published_html, published_at")
          .eq("id", siteId)
          .eq("status", "active")
          .maybeSingle();

        if (!error && data && data.published_html) {
          const publicSite: PublicSite = {
            id: data.id,
            title: data.title ?? "A Beautiful Memory",
            website_type: data.website_type ?? null,
            preview_image: data.preview_image ?? null,
            published_at: data.published_at ?? null,
            html_url: data.published_html,
            status: "active",
            is_public: true,
          };
          return { site: publicSite, htmlUrl: data.published_html };
        }
      } catch {
        // ignore
      }
    }

    return null;
  },
  async getUserSites(): Promise<Website[]> { requireConfigured(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return []; const { data, error } = await supabase.from("websites").select("*").eq("user_id", user.id).eq("status", "active").order("updated_at", { ascending: false }); if (error) throw new Error(error.message); return (data || []).map(r => asWebsite(r as Record<string, unknown>)); },
  async setStatus(siteId: string, status: Website["status"]) { requireConfigured(); const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error("Sign in required."); const { error } = await supabase.from("websites").update({ status }).eq("id", siteId).eq("user_id", user.id); if (error) throw new Error(error.message); },
  async deleteSite(siteId: string) { return this.setStatus(siteId, "trash"); },
  async restoreSite(siteId: string) { return this.setStatus(siteId, "active"); },
  async getTrashedSites(): Promise<Website[]> { requireConfigured(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return []; const { data, error } = await supabase.from("websites").select("*").eq("user_id", user.id).eq("status", "trash"); if (error) throw new Error(error.message); return (data || []).map(r => asWebsite(r as Record<string, unknown>)); },
  async permanentDeleteSite(siteId: string) { requireConfigured(); const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error("Sign in required."); const { error } = await supabase.from("websites").delete().eq("id", siteId).eq("user_id", user.id); if (error) throw new Error(error.message); },
  async renameSite(siteId: string, title: string) { requireConfigured(); const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error("Sign in required."); const { error } = await supabase.from("websites").update({ title }).eq("id", siteId).eq("user_id", user.id); if (error) throw new Error(error.message); },
  async duplicateSite(_siteId: string): Promise<Website> { throw new Error("Duplicate a published site by republishing it from the builder."); },
  async getDeployments(siteId: string): Promise<Deployment[]> { requireConfigured(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return []; const { data, error } = await supabase.from("published_versions").select("id, site_id, version_number, html_path, created_at, status").eq("site_id", siteId).eq("published_by", user.id).order("version_number", { ascending: false }); if (error) throw new Error(error.message); return (data || []).map(v => ({ id: v.id, site_id: v.site_id, version_num: v.version_number, html_url: v.html_path, title: "", created_at: v.created_at, status: v.status })); },
  async rollbackDeployment(siteId: string, versionId: string) { requireConfigured(); const { error } = await supabase.rpc("rollback_published_version", { p_site_id: siteId, p_version_id: versionId }); if (error) throw new Error(`Rollback failed: ${error.message}`); },
  async trackView(_siteId: string) {},
};
