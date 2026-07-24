// ─────────────────────────────────────────────────────────────────
// Draft Recovery & Auto Save Manager
// ─────────────────────────────────────────────────────────────────
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface DraftState {
  name1: string;
  name2: string;
  date: string;
  duration: string;
  memory: string;
  message: string;
  themeId: string;
  updatedAt: string;
}

const DRAFT_KEY = "lovecraft_active_draft";

export const draftRecovery = {
  /** Save draft locally & to Supabase if logged in */
  async saveDraft(state: Partial<DraftState>, userId?: string): Promise<Date> {
    const timestamp = new Date();
    const payload: DraftState = {
      name1: state.name1 ?? "",
      name2: state.name2 ?? "",
      date: state.date ?? "",
      duration: state.duration ?? "",
      memory: state.memory ?? "",
      message: state.message ?? "",
      themeId: state.themeId ?? "cosmic",
      updatedAt: timestamp.toISOString(),
    };

    // Save to localStorage for instant client recovery
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      } catch {
        // Storage limit warning ignored
      }
    }

    // Save to Supabase projects if authenticated
    if (isSupabaseConfigured && userId) {
      try {
        await supabase.from("projects").upsert({
          user_id: userId,
          title: `${payload.name1 || "Draft"} & ${payload.name2 || "Story"}`,
          name1: payload.name1,
          name2: payload.name2,
          date: payload.date,
          duration: payload.duration,
          memory: payload.memory,
          message: payload.message,
          theme_id: payload.themeId,
          status: "draft",
        });
      } catch {
        // Silent recovery fallback
      }
    }

    return timestamp;
  },

  /** Get active draft from localStorage */
  getDraft(): DraftState | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? (JSON.parse(raw) as DraftState) : null;
    } catch {
      return null;
    }
  },

  /** Clear draft state */
  clearDraft(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        // Ignore
      }
    }
  },
};
