// ─────────────────────────────────────────────────────────────────
// Auth Service — wraps Supabase Auth
// ─────────────────────────────────────────────────────────────────
import { supabase } from "@/lib/supabase";
import type { OAuthProvider, LoginCredentials, User } from "@/types";

export const authService = {
  /** Sign in with Google or GitHub OAuth */
  async signInWithOAuth(provider: OAuthProvider): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams:
          provider === "google"
            ? { access_type: "offline", prompt: "consent" }
            : {},
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
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw new Error(error.message);
  },

  /** Sign up with email + password */
  async signUp(creds: LoginCredentials): Promise<void> {
    const { error } = await supabase.auth.signUp({
      ...creds,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw new Error(error.message);
  },

  /** Sign out */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  /** Get current user profile from the public.users table */
  async getCurrentUser(): Promise<User | null> {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return null;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (error || !data) return null;
    return data as User;
  },

  /** Subscribe to auth state changes */
  onAuthStateChange(
    callback: (user: User | null) => void,
  ): { unsubscribe: () => void } {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const user = await authService.getCurrentUser();
          callback(user);
        } else {
          callback(null);
        }
      },
    );
    return { unsubscribe: () => subscription.unsubscribe() };
  },
};
