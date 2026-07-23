// ─────────────────────────────────────────────────────────────────
// useAuth hook — convenient access to auth state + actions
// ─────────────────────────────────────────────────────────────────
import { useAuthStore } from "@/store/auth.store";

export function useAuth() {
  const {
    user,
    isLoading,
    isAuthenticated,
    signInWithOAuth,
    signInWithPassword,
    sendMagicLink,
    signUp,
    signOut,
  } = useAuthStore();

  return {
    user,
    isLoading,
    isAuthenticated,
    signInWithOAuth,
    signInWithPassword,
    sendMagicLink,
    signUp,
    signOut,
  };
}
