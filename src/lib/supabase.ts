// ─────────────────────────────────────────────────────────────────
// Supabase Client — Singleton for frontend use
//
// Flow: PKCE (Proof Key for Code Exchange)
//   - signInWithOAuth() sends the user to Google/GitHub.
//   - Google redirects to /auth/callback?code=<short-lived-code>
//   - The callback route calls exchangeCodeForSession(code) to get tokens.
//   - Tokens are stored in localStorage under storageKey.
//
// Why NOT Implicit Flow:
//   Implicit flow returns #access_token=... in the hash at the root URL,
//   bypassing /auth/callback entirely. The app has no chance to run the
//   exchange logic, so the session is never persisted and login appears
//   to fail even though the OAuth succeeded.
//
// SSR-safety:
//   persistSession, autoRefreshToken are disabled on the server.
//   detectSessionInUrl is false — not needed with PKCE (the code exchange
//   happens explicitly in the callback route), and causes SSR issues.
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
      flowType: "pkce",           // CRITICAL: forces ?code= redirect, not #token hash
      persistSession: isBrowser,
      autoRefreshToken: isBrowser,
      detectSessionInUrl: false,  // not needed with PKCE; we exchange manually in /auth/callback
      storageKey: "lovecraft-auth",
    },
  },
);

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("placeholder"),
);
