// ─────────────────────────────────────────────────────────────────
// Promotional Video Service — Supabase Integration & Management
// ─────────────────────────────────────────────────────────────────
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type {
  PromotionalVideo,
  CreatePromoVideoInput,
  UpdatePromoVideoInput,
  TrackPromoEventInput,
  PromoVideoAnalytics,
} from "@/types/promo-video.types";

export const promoVideoService = {
  /**
   * Fetch active promotional videos for a given category (or 'global').
   * Filters by is_active=true and valid start/end dates.
   * Ordered by priority DESC, display_order ASC.
   */
  async getActiveVideos(category?: string): Promise<PromotionalVideo[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const now = new Date().toISOString();
      let query = supabase
        .from("promotional_videos")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: false })
        .order("display_order", { ascending: true });

      if (category && category !== "all") {
        // Fetch videos matching category OR global
        query = query.in("category", [category, "global"]);
      }

      const { data, error } = await query;

      if (error) {
        console.warn("[PromoVideoService] Failed to fetch active videos:", error.message);
        return [];
      }

      if (!data) return [];

      // Filter in-memory for date bounds to be completely safe
      const activeData = (data as PromotionalVideo[]).filter((v) => {
        if (v.start_at && new Date(v.start_at).toISOString() > now) return false;
        if (v.end_at && new Date(v.end_at).toISOString() < now) return false;
        return true;
      });

      return activeData;
    } catch (err) {
      console.warn("[PromoVideoService] Exception fetching active videos:", err);
      return [];
    }
  },

  /**
   * Admin: Fetch all promotional videos with aggregated analytics.
   */
  async getAllVideosAdmin(): Promise<PromotionalVideo[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data: videos, error: videoError } = await supabase
        .from("promotional_videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (videoError || !videos) {
        console.error("[PromoVideoService] Admin fetch error:", videoError?.message);
        return [];
      }

      // Fetch analytics summary events
      const { data: events } = await supabase
        .from("promotional_video_events")
        .select("video_id, event_type");

      // Aggregate analytics per video
      const analyticsMap = new Map<string, PromoVideoAnalytics>();
      if (events) {
        for (const ev of events) {
          const vId = ev.video_id;
          const stats = analyticsMap.get(vId) || {
            impressions: 0,
            plays: 0,
            completions: 0,
            cta_clicks: 0,
            ctr: 0,
            completion_rate: 0,
          };

          if (ev.event_type === "impression") stats.impressions++;
          else if (ev.event_type === "play") stats.plays++;
          else if (ev.event_type === "complete") stats.completions++;
          else if (ev.event_type === "cta_click") stats.cta_clicks++;

          analyticsMap.set(vId, stats);
        }

        // Calculate rates
        for (const stats of analyticsMap.values()) {
          stats.ctr = stats.impressions > 0 ? (stats.cta_clicks / stats.impressions) * 100 : 0;
          stats.completion_rate = stats.plays > 0 ? (stats.completions / stats.plays) * 100 : 0;
        }
      }

      return (videos as PromotionalVideo[]).map((v) => ({
        ...v,
        analytics: analyticsMap.get(v.id) || {
          impressions: 0,
          plays: 0,
          completions: 0,
          cta_clicks: 0,
          ctr: 0,
          completion_rate: 0,
        },
      }));
    } catch (err) {
      console.error("[PromoVideoService] Exception in getAllVideosAdmin:", err);
      return [];
    }
  },

  /**
   * Upload video or poster file to Supabase Storage bucket 'promotional-videos'
   */
  async uploadMediaFile(
    file: File,
    folder: "videos" | "posters",
    onProgress?: (percent: number) => void,
  ): Promise<string> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured");
    }

    // Validate file type
    if (folder === "videos") {
      const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"];
      if (!allowedVideoTypes.includes(file.type)) {
        throw new Error("Invalid video file type. Only MP4, WebM, and MOV videos are allowed.");
      }
    } else {
      const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedImageTypes.includes(file.type)) {
        throw new Error("Invalid poster image file type. Only JPEG, PNG, WebP, and GIF images are allowed.");
      }
    }

    onProgress?.(10);

    const sanitizeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    const filename = `${folder}/${Date.now()}-${sanitizeName}`;

    onProgress?.(30);

    const { data, error } = await supabase.storage
      .from("promotional-videos")
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("[PromoVideoService] Storage upload error:", error.message);
      throw new Error(`Upload failed: ${error.message}`);
    }

    onProgress?.(80);

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("promotional-videos")
      .getPublicUrl(data.path);

    onProgress?.(100);
    return publicUrlData.publicUrl;
  },

  /**
   * Admin: Create a new promotional video entry.
   */
  async createVideo(input: CreatePromoVideoInput): Promise<PromotionalVideo> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured");
    }

    const { data, error } = await supabase
      .from("promotional_videos")
      .insert({
        title: input.title,
        description: input.description || null,
        video_url: input.video_url,
        poster_url: input.poster_url || null,
        cta_text: input.cta_text || "Explore Templates",
        cta_url: input.cta_url || "/templates",
        category: input.category || "global",
        aspect_ratio: input.aspect_ratio || "16:9",
        is_active: input.is_active ?? true,
        priority: input.priority ?? 0,
        display_order: input.display_order ?? 0,
        autoplay: input.autoplay ?? true,
        muted: input.muted ?? true,
        loop: input.loop ?? true,
        start_at: input.start_at || null,
        end_at: input.end_at || null,
        duration: input.duration || 0,
        file_size: input.file_size || 0,
        mime_type: input.mime_type || "video/mp4",
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create promotional video: ${error?.message}`);
    }

    return data as PromotionalVideo;
  },

  /**
   * Admin: Update an existing promotional video entry.
   */
  async updateVideo(input: UpdatePromoVideoInput): Promise<PromotionalVideo> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured");
    }

    const { id, ...payload } = input;
    const { data, error } = await supabase
      .from("promotional_videos")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update promotional video: ${error?.message}`);
    }

    return data as PromotionalVideo;
  },

  /**
   * Admin: Delete a promotional video entry.
   */
  async deleteVideo(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from("promotional_videos")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete promotional video: ${error.message}`);
    }
  },

  /**
   * Track an analytics event for a promotional video (impression, play, quartile, CTA click)
   */
  async trackEvent(input: TrackPromoEventInput): Promise<void> {
    if (!isSupabaseConfigured) return;

    try {
      await supabase.from("promotional_video_events").insert({
        video_id: input.video_id,
        event_type: input.event_type,
        category: input.category || "global",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      });
    } catch {
      // Fire-and-forget: analytics tracking should never crash the app
    }
  },
};
