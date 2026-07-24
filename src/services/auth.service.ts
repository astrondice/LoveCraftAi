// ─────────────────────────────────────────────────────────────────
// Auth Service — wraps Supabase Auth
// ─────────────────────────────────────────────────────────────────
//
// ROOT CAUSE FIX:
//   The `handle_new_user()` trigger inserts a row into public.users on
//   auth.users INSERT. However this can be missed for:
//     - OAuth users who authenticated before the migration ran
//     - Edge cases where the trigger execution failed silently
//     - Users that exist in auth.users but not in public.users
//
//   When the profile row is missing, PostgREST returns PGRST116 (no rows)
//   which supabase-js surfaces as an error. The old code did:
//     if (error || !data) return null
//   This made getCurrentUser() return null for any authenticated user
//   without a profile row — causing the auth store to mark them as
//   unauthenticated and redirecting them back to /login.
//
//   Fix: if the profile row is missing, upsert it from auth.users data
//   so we NEVER return null for a user that has a valid Supabase session.
// ─────────────────────────────────────────────────────────────────
import { supabase } from "@/lib/supabase";
import type { OAuthProvider, LoginCredentials, User } from "@/types";

function getOrigin(): string {
  // Always use the actual current origin in the browser — works correctly
  // in both dev (http://localhost:8080) and production (https://love-craft-ai.vercel.app)
  // with zero configuration.
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  // SSR fallback (server-side rendering only) — never used for OAuth redirectTo
  return import.meta.env.VITE_APP_URL || "https://love-craft-ai.vercel.app";
}

export const authService = {
  /** Sign in with Google or GitHub OAuth */
  async signInWithOAuth(provider: OAuthProvider, customRedirectTo?: string): Promise<void> {
    const targetRedirect = customRedirectTo || `${getOrigin()}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: targetRedirect,
        queryParams: provider === "google" ? { access_type: "offline", prompt: "consent" } : {},
      },
    });
    if (error) throw new Error(error.message);
  },

  /** Sign in with email + password */
  async signInWithPassword(creds: LoginCredentials): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword(creds);
    if (error) throw new Error(error.message);
  },

  /** Send magic link email */
  async sendMagicLink(email: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${getOrigin()}/auth/callback`,
      },
    });
    if (error) throw new Error(error.message);
  },

  /** Sign up with email + password */
  async signUp(creds: LoginCredentials): Promise<void> {
    const { error } = await supabase.auth.signUp({
      ...creds,
      options: {
        emailRedirectTo: `${getOrigin()}/auth/callback`,
      },
    });
    if (error) throw new Error(error.message);
  },

  /** Sign out */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  /**
   * Get current user profile from public.users.
   *
   * If no profile row exists (trigger missed, pre-migration OAuth user, etc.)
   * we upsert one from auth.users data so the user is NEVER bounced to /login
   * simply because the profile table has a gap.
   */
  async getCurrentUser(): Promise<User | null> {
    // 1. Verify there is an active Supabase session
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      console.log("[LoveCraft Auth] getCurrentUser: no active session");
      return null;
    }

    console.log("[LoveCraft Auth] getCurrentUser: session found for", authUser.email);

    // 2. Try to read existing profile from public.profiles or public.users
    let existing: User | null = null;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    if (profileData) {
      existing = profileData as User;
    } else {
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();
      existing = userData as User;
    }

    if (existing) {
      console.log("[LoveCraft Auth] getCurrentUser: profile found");
      return existing;
    }

    // 3. Profile row is missing — upsert to profiles or users
    console.warn(
      "[LoveCraft Auth] getCurrentUser: profile missing for",
      authUser.email,
      "— creating now",
    );

    const profilePayload = {
      id: authUser.id,
      email: authUser.email ?? "",
      name: authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? null,
      avatar_url: authUser.user_metadata?.avatar_url ?? null,
      role: "user" as const,
      plan: "free" as const,
    };

    let { data: upserted } = await supabase
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" })
      .select("*")
      .maybeSingle();

    if (!upserted) {
      const { data: userUpserted } = await supabase
        .from("users")
        .upsert(profilePayload, { onConflict: "id" })
        .select("*")
        .maybeSingle();
      upserted = userUpserted;
    }

    if (!upserted) {
      console.warn(
        "[LoveCraft Auth] getCurrentUser: profile upsert skipped — using fallback user object",
      );
      return authService._buildFallbackUser(authUser);
    }

    console.log("[LoveCraft Auth] getCurrentUser: profile created via upsert");
    return (upserted ?? authService._buildFallbackUser(authUser)) as User;
  },

  /**
   * Build a minimal in-memory User from auth.users data.
   * Used as a last-resort fallback so an authenticated user is never
   * treated as unauthenticated due to a profile table issue.
   */
  _buildFallbackUser(authUser: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  }): User {
    const now = new Date().toISOString();
    return {
      id: authUser.id,
      email: authUser.email ?? "",
      name:
        (authUser.user_metadata?.full_name as string | null) ??
        (authUser.user_metadata?.name as string | null) ??
        null,
      avatar_url: (authUser.user_metadata?.avatar_url as string | null) ?? null,
      role: "user",
      plan: "free",
      created_at: now,
      updated_at: now,
    };
  },

  /** Subscribe to auth state changes */
  onAuthStateChange(callback: (user: User | null) => void): { unsubscribe: () => void } {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log(
        "[LoveCraft Auth] onAuthStateChange event:",
        _event,
        "| user:",
        session?.user?.email ?? "none",
      );
      if (session?.user) {
        const user = await authService.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
    return { unsubscribe: () => subscription.unsubscribe() };
  },
};
