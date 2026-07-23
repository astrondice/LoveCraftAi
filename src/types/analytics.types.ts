// ─────────────────────────────────────────────────────────────────
// Analytics Types
// ─────────────────────────────────────────────────────────────────

export type EventType = "view" | "download" | "qr_scan" | "share";
export type DeviceType = "desktop" | "tablet" | "mobile" | "unknown";

export interface AnalyticsEvent {
  id: string;
  site_id: string;
  event_type: EventType;
  country: string | null;
  city: string | null;
  device: DeviceType | null;
  os: string | null;
  browser: string | null;
  referrer: string | null;
  ip_hash: string | null;
  created_at: string;
}

export interface AnalyticsSummary {
  total_views: number;
  unique_visitors: number;
  top_countries: Array<{ country: string; count: number }>;
  top_cities: Array<{ city: string; count: number }>;
  device_breakdown: Array<{ device: DeviceType; count: number }>;
  referrer_breakdown: Array<{ referrer: string; count: number }>;
  views_over_time: Array<{ date: string; views: number }>;
  last_viewed_at: string | null;
}

export interface TrackEventInput {
  site_id: string;
  event_type: EventType;
  referrer?: string;
}
