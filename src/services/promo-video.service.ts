// ─────────────────────────────────────────────────────────────────
// Promotional Video & Campaign Service — Supabase Integration
// ─────────────────────────────────────────────────────────────────
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type {
  PromotionalVideo,
  PromotionalCampaign,
  CreatePromoVideoInput,
  UpdatePromoVideoInput,
  CreateCampaignInput,
  TrackPromoEventInput,
  PromoVideoAnalytics,
} from "@/types/promo-video.types";

// ── Fallback Preset Assets (Raksha Bandhan 2026 Campaign) ─────────
// Used when Supabase is disconnected or table is unseeded
const FALLBACK_RAKSHA_BANDHAN_ASSETS: PromotionalVideo[] = [
  {
    id: "fallback-rakhi-1",
    title: "The Purest Bond Ever",
    subtitle: "A bond that time can't break",
    description: "Golden sacred thread animations, childhood throwback photo frames, and documentary storytelling.",
    media_type: "image",
    video_url: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=80",
    poster_url: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=80",
    cta_text: "Explore Raksha Bandhan Templates",
    cta_url: "/templates/raksha-bandhan",
    category: "raksha-bandhan",
    aspect_ratio: "16:9",
    is_active: true,
    priority: 100,
    display_order: 1,
    autoplay: true,
    muted: true,
    loop: true,
    start_at: null,
    end_at: null,
    duration: 0,
    file_size: 0,
    mime_type: "image/jpeg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fallback-rakhi-2",
    title: "Threads of Love",
    subtitle: "Handcrafted memories, wrapped in love",
    description: "Handcrafted scrapbook aesthetic with deckled paper edges, polaroid memories, and marigold silk accents.",
    media_type: "image",
    video_url: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=1200&q=80",
    poster_url: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=1200&q=80",
    cta_text: "Explore Raksha Bandhan Templates",
    cta_url: "/templates/raksha-bandhan",
    category: "raksha-bandhan",
    aspect_ratio: "16:9",
    is_active: true,
    priority: 90,
    display_order: 2,
    autoplay: true,
    muted: true,
    loop: true,
    start_at: null,
    end_at: null,
    duration: 0,
    file_size: 0,
    mime_type: "image/jpeg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fallback-rakhi-3",
    title: "Our Childhood",
    subtitle: "The best memories were made together",
    description: "Retro film layout designed to showcase silly childhood fights, shared secrets, and growing up together.",
    media_type: "image",
    video_url: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80",
    poster_url: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80",
    cta_text: "Explore Raksha Bandhan Templates",
    cta_url: "/templates/raksha-bandhan",
    category: "raksha-bandhan",
    aspect_ratio: "16:9",
    is_active: true,
    priority: 80,
    display_order: 3,
    autoplay: true,
    muted: true,
    loop: true,
    start_at: null,
    end_at: null,
    duration: 0,
    file_size: 0,
    mime_type: "image/jpeg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fallback-rakhi-4",
    title: "Miles Apart, Hearts Together",
    subtitle: "No distance can weaken this bond",
    description: "Designed for siblings living across different cities or countries to celebrate Rakhi virtually.",
    media_type: "image",
    video_url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
    poster_url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
    cta_text: "Explore Raksha Bandhan Templates",
    cta_url: "/templates/raksha-bandhan",
    category: "raksha-bandhan",
    aspect_ratio: "16:9",
    is_active: true,
    priority: 70,
    display_order: 4,
    autoplay: true,
    muted: true,
    loop: true,
    start_at: null,
    end_at: null,
    duration: 0,
    file_size: 0,
    mime_type: "image/jpeg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fallback-rakhi-5",
    title: "Dear Brother / Dear Sister",
    subtitle: "Thank you for being my forever friend",
    description: "An elegant, letterform tribute experience with unfolding paper presentation, ink text reveal, and wax seal.",
    media_type: "image",
    video_url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80",
    poster_url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80",
    cta_text: "Explore Raksha Bandhan Templates",
    cta_url: "/templates/raksha-bandhan",
    category: "raksha-bandhan",
    aspect_ratio: "16:9",
    is_active: true,
    priority: 60,
    display_order: 5,
    autoplay: true,
    muted: true,
    loop: true,
    start_at: null,
    end_at: null,
    duration: 0,
    file_size: 0,
    mime_type: "image/jpeg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fallback-rakhi-6",
    title: "Forever Together",
    subtitle: "Different yet perfect, just like us",
    description: "Flagship documentary masterpiece with chapter navigation, film progress, and movie credits ending.",
    media_type: "image",
    video_url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
    poster_url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
    cta_text: "Explore Raksha Bandhan Templates",
    cta_url: "/templates/raksha-bandhan",
    category: "raksha-bandhan",
    aspect_ratio: "16:9",
    is_active: true,
    priority: 50,
    display_order: 6,
    autoplay: true,
    muted: true,
    loop: true,
    start_at: null,
    end_at: null,
    duration: 0,
    file_size: 0,
    mime_type: "image/jpeg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const promoVideoService = {
  /**
   * Fetch active promotional videos/images for a category (or 'global').
   * If category is specified, prefers category-specific assets first, then global.
   */
  async getActiveVideos(category?: string): Promise<PromotionalVideo[]> {
    if (!isSupabaseConfigured) {
      return category === "raksha-bandhan"
        ? FALLBACK_RAKSHA_BANDHAN_ASSETS
        : FALLBACK_RAKSHA_BANDHAN_ASSETS;
    }

    try {
      const now = new Date().toISOString();
      let query = supabase
        .from("promotional_videos")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: false })
        .order("display_order", { ascending: true });

      if (category && category !== "all") {
        query = query.in("category", [category, "global"]);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        // Fallback to presets if query fails or table is empty
        return category === "raksha-bandhan"
          ? FALLBACK_RAKSHA_BANDHAN_ASSETS
          : FALLBACK_RAKSHA_BANDHAN_ASSETS;
      }

      // Filter in-memory for date bounds
      const activeData = (data as PromotionalVideo[]).filter((v) => {
        if (v.start_at && new Date(v.start_at).toISOString() > now) return false;
        if (v.end_at && new Date(v.end_at).toISOString() < now) return false;
        return true;
      });

      return activeData.length > 0 ? activeData : FALLBACK_RAKSHA_BANDHAN_ASSETS;
    } catch (err) {
      console.warn("[PromoVideoService] Exception fetching active videos, using fallback:", err);
      return FALLBACK_RAKSHA_BANDHAN_ASSETS;
    }
  },

  /**
   * Admin: Fetch all promotional campaigns.
   */
  async getCampaignsAdmin(): Promise<PromotionalCampaign[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from("promotional_campaigns")
        .select("*, assets:promotional_videos(*)")
        .order("priority", { ascending: false });

      if (error) {
        console.error("[PromoVideoService] Get campaigns error:", error.message);
        return [];
      }
      return (data || []) as PromotionalCampaign[];
    } catch {
      return [];
    }
  },

  /**
   * Admin: Fetch all promotional videos with aggregated analytics.
   */
  async getAllVideosAdmin(): Promise<PromotionalVideo[]> {
    if (!isSupabaseConfigured) return FALLBACK_RAKSHA_BANDHAN_ASSETS;

    try {
      const { data: videos, error: videoError } = await supabase
        .from("promotional_videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (videoError || !videos || videos.length === 0) {
        return FALLBACK_RAKSHA_BANDHAN_ASSETS;
      }

      // Fetch analytics summary events
      const { data: events } = await supabase
        .from("promotional_video_events")
        .select("video_id, event_type");

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
      return FALLBACK_RAKSHA_BANDHAN_ASSETS;
    }
  },

  /**
   * Upload video or poster file with Strict File Security Validation (Phase 3).
   * Rejects dangerous file types (.exe, .sh, .php, .js, .html, .dll, etc.).
   */
  async uploadMediaFile(
    file: File,
    folder: "videos" | "posters",
    onProgress?: (percent: number) => void,
  ): Promise<string> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured");
    }

    const filenameLower = file.name.toLowerCase();
    const forbiddenExts = [
      ".exe", ".bat", ".cmd", ".sh", ".php", ".js", ".html", ".htm",
      ".dll", ".so", ".jar", ".vbs", ".ps1", ".py", ".bin",
    ];

    if (forbiddenExts.some((ext) => filenameLower.endsWith(ext))) {
      throw new Error(`Security Violation: File extension not allowed.`);
    }

    if (folder === "videos") {
      const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"];
      if (!allowedVideoTypes.includes(file.type) && !file.type.startsWith("video/")) {
        throw new Error("Invalid video file format. Only MP4, WebM, and MOV are supported.");
      }
    } else {
      const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedImageTypes.includes(file.type) && !file.type.startsWith("image/")) {
        throw new Error("Invalid image format. Only JPEG, PNG, WebP, and GIF are supported.");
      }
    }

    onProgress?.(15);

    const sanitizeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    const storagePath = `${folder}/${Date.now()}-${sanitizeName}`;

    onProgress?.(35);

    const { data, error } = await supabase.storage
      .from("promotional-videos")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("[PromoVideoService] Storage upload error:", error.message);
      throw new Error(`Upload failed: ${error.message}`);
    }

    onProgress?.(85);

    const { data: publicUrlData } = supabase.storage
      .from("promotional-videos")
      .getPublicUrl(data.path);

    onProgress?.(100);
    return publicUrlData.publicUrl;
  },

  /**
   * Admin: Create a promotional campaign.
   */
  async createCampaign(input: CreateCampaignInput): Promise<PromotionalCampaign> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured");

    const slug = input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const { data, error } = await supabase
      .from("promotional_campaigns")
      .insert({
        name: input.name,
        slug,
        category: input.category || "raksha-bandhan",
        description: input.description || null,
        is_active: input.is_active ?? true,
        priority: input.priority ?? 10,
        start_at: input.start_at || null,
        end_at: input.end_at || null,
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to create campaign: ${error?.message}`);
    return data as PromotionalCampaign;
  },

  /**
   * Admin: Create a new promotional video / image asset.
   */
  async createVideo(input: CreatePromoVideoInput): Promise<PromotionalVideo> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured");

    const { data, error } = await supabase
      .from("promotional_videos")
      .insert({
        campaign_id: input.campaign_id || null,
        title: input.title,
        subtitle: input.subtitle || null,
        description: input.description || null,
        media_type: input.media_type || (input.video_url.match(/\.(jpg|jpeg|png|webp)/i) ? "image" : "video"),
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
      throw new Error(`Failed to create promotional asset: ${error?.message}`);
    }

    return data as PromotionalVideo;
  },

  /**
   * Admin: Update an existing promotional asset.
   */
  async updateVideo(input: UpdatePromoVideoInput): Promise<PromotionalVideo> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured");

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
      throw new Error(`Failed to update promotional asset: ${error?.message}`);
    }

    return data as PromotionalVideo;
  },

  /**
   * Admin: Delete a promotional asset.
   */
  async deleteVideo(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from("promotional_videos")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete promotional asset: ${error.message}`);
    }
  },

  /**
   * Track analytics event (impression, play, 25%, 50%, 75%, complete, cta_click)
   */
  async trackEvent(input: TrackPromoEventInput): Promise<void> {
    if (!isSupabaseConfigured || input.video_id.startsWith("fallback-")) return;

    try {
      await supabase.from("promotional_video_events").insert({
        video_id: input.video_id,
        event_type: input.event_type,
        category: input.category || "global",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      });
    } catch {
      // Fire-and-forget
    }
  },
};
