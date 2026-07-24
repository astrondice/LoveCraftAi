// ─────────────────────────────────────────────────────────────────
// Supabase Client — Singleton for frontend use
// SSR-safe: persistSession, autoRefreshToken, and detectSessionInUrl
// are disabled on the server (typeof window === "undefined").
// ─────────────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[LoveCraft] Supabase credentials not configured. " +
      "Copy .env.example to .env.local and fill in your credentials.",
  );
}

const isBrowser = typeof window !== "undefined";

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: isBrowser,
      autoRefreshToken: isBrowser,
      detectSessionInUrl: isBrowser,
      storageKey: "lovecraft-auth",
    },
  },
);

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("placeholder"),
);
