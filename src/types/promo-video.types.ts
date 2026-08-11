// ─────────────────────────────────────────────────────────────────
// Promotional Video & Campaign System Types
// ─────────────────────────────────────────────────────────────────

export type VideoAspectRatio = "16:9" | "9:16" | "1:1" | "4:5";
export type MediaType = "video" | "image";

export type PromoEventType =
  | "impression"
  | "play"
  | "25%"
  | "50%"
  | "75%"
  | "complete"
  | "cta_click";

export interface PromotionalCampaign {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  is_active: boolean;
  priority: number;
  start_at: string | null;
  end_at: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  assets?: PromotionalVideo[];
}

export interface PromotionalVideo {
  id: string;
  campaign_id?: string | null;
  title: string;
  subtitle?: string | null;
  description: string | null;
  media_type: MediaType;
  video_url: string;
  poster_url: string | null;
  cta_text: string;
  cta_url: string;
  category: string; // 'global' | 'love' | 'raksha-bandhan' | 'birthday' | 'wedding' etc.
  aspect_ratio: VideoAspectRatio;
  is_active: boolean;
  priority: number;
  display_order: number;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  start_at: string | null;
  end_at: string | null;
  duration: number;
  file_size: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  analytics?: PromoVideoAnalytics;
}

export interface CreatePromoVideoInput {
  campaign_id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  media_type?: MediaType;
  video_url: string;
  poster_url?: string;
  cta_text?: string;
  cta_url?: string;
  category?: string;
  aspect_ratio?: VideoAspectRatio;
  is_active?: boolean;
  priority?: number;
  display_order?: number;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  start_at?: string | null;
  end_at?: string | null;
  duration?: number;
  file_size?: number;
  mime_type?: string;
}

export interface UpdatePromoVideoInput extends Partial<CreatePromoVideoInput> {
  id: string;
}

export interface CreateCampaignInput {
  name: string;
  slug?: string;
  category?: string;
  description?: string;
  is_active?: boolean;
  priority?: number;
  start_at?: string | null;
  end_at?: string | null;
}

export interface PromoVideoAnalytics {
  impressions: number;
  plays: number;
  completions: number;
  cta_clicks: number;
  ctr: number; // Click Through Rate percentage
  completion_rate: number; // Completion Rate percentage
}

export interface TrackPromoEventInput {
  video_id: string;
  event_type: PromoEventType;
  category?: string;
}
