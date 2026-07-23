// ─────────────────────────────────────────────────────────────────
// Auth Types
// ─────────────────────────────────────────────────────────────────

export type UserRole = "user" | "admin" | "superadmin";
export type UserPlan = "free" | "pro" | "enterprise";

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: UserRole;
  plan: UserPlan;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export type OAuthProvider = "google" | "github";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface MagicLinkRequest {
  email: string;
}
