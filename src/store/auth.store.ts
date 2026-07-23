// ─────────────────────────────────────────────────────────────────
// Auth Store — Zustand store for authentication state
// ─────────────────────────────────────────────────────────────────
import { create } from "zustand";
import { authService } from "@/services/auth.service";
import type { User, OAuthProvider } from "@/types";

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  // Actions
  initialize: () => Promise<void>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isLoading: false }),

  initialize: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: !!user, isLoading: false });

      // Subscribe to auth state changes
      authService.onAuthStateChange((updatedUser) => {
        set({
          user: updatedUser,
          isAuthenticated: !!updatedUser,
          isLoading: false,
        });
      });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  signInWithOAuth: async (provider) => {
    await authService.signInWithOAuth(provider);
  },

  signInWithPassword: async (email, password) => {
    await authService.signInWithPassword({ email, password });
    const user = await authService.getCurrentUser();
    set({ user, isAuthenticated: !!user });
  },

  sendMagicLink: async (email) => {
    await authService.sendMagicLink(email);
  },

  signUp: async (email, password) => {
    await authService.signUp({ email, password });
  },

  signOut: async () => {
    await authService.signOut();
    set({ user: null, isAuthenticated: false });
  },
}));
