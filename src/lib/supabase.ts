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
import { createClient } from "@supabase/supabase-js";

const getEnvVar = (name: string): string => {
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[name]) {
    return import.meta.env[name] as string;
  }
  if (typeof process !== "undefined" && process.env && process.env[name]) {
    return process.env[name] as string;
  }
  return "";
};

const supabaseUrl = getEnvVar("VITE_SUPABASE_URL") || getEnvVar("SUPABASE_URL");
const supabaseAnonKey = getEnvVar("VITE_SUPABASE_ANON_KEY") || getEnvVar("SUPABASE_ANON_KEY");

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
