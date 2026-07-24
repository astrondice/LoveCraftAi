// ─────────────────────────────────────────────────────────────────
// Quota Service — Manages user plan limits (Free vs Pro)
// ─────────────────────────────────────────────────────────────────
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface UserQuota {
  user_id: string;
  plan: "free" | "pro" | "enterprise";
  websites_limit: number;
  ai_gen_limit: number;
  ai_gen_count: number;
  storage_bytes_max: number;
}

export const quotaService = {
  /** Fetch or initialize current user quota */
  async getQuota(userId: string): Promise<UserQuota> {
    if (!isSupabaseConfigured) {
      return {
        user_id: userId,
        plan: "free",
        websites_limit: 3,
        ai_gen_limit: 100,
        ai_gen_count: 0,
        storage_bytes_max: 52428800,
      };
    }

    const { data } = await supabase
      .from("user_quotas")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) return data as UserQuota;

    // Default Free quota initialization
    const fallback: UserQuota = {
      user_id: userId,
      plan: "free",
      websites_limit: 3,
      ai_gen_limit: 100,
      ai_gen_count: 0,
      storage_bytes_max: 52428800,
    };

    try {
      await supabase.from("user_quotas").insert(fallback);
    } catch {
      // Ignore
    }

    return fallback;
  },

  /** Increment AI generation count for user */
  async incrementAiUsage(userId: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      const quota = await this.getQuota(userId);
      if (quota.plan === "free" && quota.ai_gen_count >= quota.ai_gen_limit) {
        throw new Error("Free AI generation limit reached (100 generations). Please upgrade to Pro!");
      }
      await supabase
        .from("user_quotas")
        .update({ ai_gen_count: quota.ai_gen_count + 1 })
        .eq("user_id", userId);
    } catch (err) {
      if (err instanceof Error && err.message.includes("limit reached")) {
        throw err;
      }
    }
  },

  /** Verify website creation quota */
  async canCreateWebsite(userId: string, currentWebsiteCount: number): Promise<boolean> {
    const quota = await this.getQuota(userId);
    if (quota.plan !== "free") return true;
    return currentWebsiteCount < quota.websites_limit;
  },
};
