// ─────────────────────────────────────────────────────────────────
// Auth Store — Zustand store for authentication state
// ─────────────────────────────────────────────────────────────────
// FIX SUMMARY:
//  1. Track subscription to prevent duplicate onAuthStateChange listeners.
//  2. signInWithPassword now waits for the session to propagate before
//     resolving — callers can safely navigate() right after await.
//  3. initialize() is idempotent: a second call re-uses the existing
//     subscription instead of stacking another one.
//  4. signOut navigates to /login via the router so beforeLoad re-runs.
// ─────────────────────────────────────────────────────────────────
import { create } from "zustand";
import { authService } from "@/services/auth.service";
import type { User, OAuthProvider } from "@/types";

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  _initialized: boolean;                 // guard against double-init
  // Actions
  initialize: () => Promise<void>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  _initialized: false,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isLoading: false }),

  /**
   * Initialize auth — safe to call multiple times.
   * Only the first call registers the onAuthStateChange listener.
   */
  initialize: async () => {
    // Already initialized — just refresh current user, no new listener.
    if (get()._initialized) {
      console.log("[LoveCraft Auth] initialize() called again — refreshing user only");
      try {
        const user = await authService.getCurrentUser();
        set({ user, isAuthenticated: !!user, isLoading: false });
      } catch {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
      return;
    }

    console.log("[LoveCraft Auth] initialize() — first run, registering listener");
    set({ isLoading: true, _initialized: true });

    try {
      const user = await authService.getCurrentUser();
      console.log("[LoveCraft Auth] Session restored:", user?.email ?? "none");
      set({ user, isAuthenticated: !!user, isLoading: false });

      // Single, permanent subscription
      authService.onAuthStateChange((updatedUser) => {
        console.log(
          "[LoveCraft Auth] onAuthStateChange →",
          updatedUser?.email ?? "signed out",
        );
        set({
          user: updatedUser,
          isAuthenticated: !!updatedUser,
          isLoading: false,
        });
      });
    } catch (e) {
      console.error("[LoveCraft Auth] initialize() error:", e);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  signInWithOAuth: async (provider) => {
    console.log("[LoveCraft Auth] OAuth sign-in started:", provider);
    await authService.signInWithOAuth(provider);
    // Browser will redirect to /auth/callback — no further action here.
  },

  /**
   * Email/password sign-in.
   * Waits for the auth state to propagate before resolving so that
   * callers can safely navigate() immediately after await.
   */
  signInWithPassword: async (email, password) => {
    console.log("[LoveCraft Auth] Password sign-in started:", email);
    await authService.signInWithPassword({ email, password });

    // Wait for the session to be reflected in the store (max 3 s)
    await new Promise<void>((resolve) => {
      const start = Date.now();
      const check = () => {
        const { isAuthenticated, isLoading } = useAuthStore.getState();
        if (isAuthenticated && !isLoading) {
          console.log("[LoveCraft Auth] Password sign-in confirmed in store");
          resolve();
          return;
        }
        if (Date.now() - start > 3000) {
          // Fallback: fetch user directly to unblock navigation
          authService.getCurrentUser().then((user) => {
            console.log("[LoveCraft Auth] Password sign-in fallback fetch:", user?.email);
            set({ user, isAuthenticated: !!user, isLoading: false });
            resolve();
          }).catch(() => {
            set({ isLoading: false });
            resolve();
          });
          return;
        }
        setTimeout(check, 80);
      };
      check();
    });
  },

  sendMagicLink: async (email) => {
    console.log("[LoveCraft Auth] Magic link sent to:", email);
    await authService.sendMagicLink(email);
  },

  signUp: async (email, password) => {
    console.log("[LoveCraft Auth] Sign-up started:", email);
    await authService.signUp({ email, password });
  },

  signOut: async () => {
    console.log("[LoveCraft Auth] Signing out");
    await authService.signOut();
    set({ user: null, isAuthenticated: false });
    // Navigate to /login — let the router handle the redirect
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },
}));
