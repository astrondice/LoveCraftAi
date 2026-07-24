// ─────────────────────────────────────────────────────────────────
// /auth/callback — Supabase OAuth & magic-link redirect handler
// ─────────────────────────────────────────────────────────────────
// FIX SUMMARY:
//  1. Handles both PKCE (code) and implicit (token fragment) flows.
//  2. After exchanging the code, directly sets the user in the store
//     instead of calling initialize() (which would register a 2nd listener).
//  3. Handles the case where Supabase has already set the session via
//     detectSessionInUrl — just read it, don't re-exchange.
//  4. Added structured logging for every step.
// ─────────────────────────────────────────────────────────────────
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Heart, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth.store";
import { Logo } from "@/components/ui/Logo";
import { BackgroundFX } from "@/components/animations/BackgroundFX";
import { z } from "zod";

const callbackSearchSchema = z.object({
  next: z.string().optional(),
  code: z.string().optional(),
  token_hash: z.string().optional(), // PKCE magic-link flow
  type: z.string().optional(),       // e.g. "email", "recovery"
  error: z.string().optional(),
  error_description: z.string().optional(),
});

export const Route = createFileRoute("/auth/callback")({
  validateSearch: callbackSearchSchema,
  head: () => ({
    meta: [{ title: "Signing you in — LoveCraft AI" }, { name: "robots", content: "noindex" }],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const setUser = useAuthStore((s) => s.setUser);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    async function handleCallback() {
      console.log("[LoveCraft Auth] /auth/callback reached", {
        hasCode: !!search.code,
        hasError: !!search.error,
        next: search.next,
      });

      try {
        // 1. Handle Supabase error returned in query params
        if (search.error) {
          throw new Error(search.error_description ?? search.error);
        }

        let session = null;

        // 2a. PKCE flow: exchange the authorization code for a session
        if (search.code) {
          console.log("[LoveCraft Auth] Exchanging PKCE code for session");
          const { data, error } = await supabase.auth.exchangeCodeForSession(search.code);
          if (error) throw new Error(error.message);
          session = data.session;
          console.log("[LoveCraft Auth] PKCE exchange successful, user:", session?.user?.email);
        } else if (search.token_hash) {
          // 2b. PKCE magic-link / email OTP flow
          console.log("[LoveCraft Auth] Verifying PKCE token_hash (magic link)");
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: search.token_hash,
            type: (search.type as "email" | "recovery" | "invite") ?? "email",
          });
          if (error) throw new Error(error.message);
          session = data.session;
          console.log("[LoveCraft Auth] Magic-link verified, user:", session?.user?.email);
        } else {
          // Fallback: check if Supabase already set a session (shouldn't happen with PKCE
          // but covers edge cases like direct navigation to /auth/callback).
          console.warn("[LoveCraft Auth] No code or token_hash in URL — checking existing session");
          const { data } = await supabase.auth.getSession();
          session = data.session;
          if (!session) {
            throw new Error(
              "No authentication code received. Please try signing in again.",
            );
          }
          console.log("[LoveCraft Auth] Fallback session found:", session.user?.email);
        }

        if (!session?.user) {
          throw new Error("No session returned after authentication.");
        }

        // 3. Update the auth store directly (avoid calling initialize() again
        //    which would register a duplicate onAuthStateChange listener).
        //    The onAuthStateChange listener already registered in __root.tsx
        //    will fire automatically — but we also push directly to be safe.
        const { authService } = await import("@/services/auth.service");
        const userProfile = await authService.getCurrentUser();
        console.log("[LoveCraft Auth] User profile loaded:", userProfile?.email);
        setUser(userProfile);

        setStatus("success");
        const { getPendingPublish } = await import("@/lib/pending-publish");
        const pending = getPendingPublish();
        const next = search.next ?? (pending ? "/generate?autoPublish=true" : "/dashboard");
        console.log("[LoveCraft Auth] Redirecting to:", next);

        // Small delay so the user sees the success heart animation
        setTimeout(() => {
          if (next.includes("?")) {
            window.location.href = next;
          } else {
            void navigate({ to: next as "/" });
          }
        }, 900);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Authentication failed";
        console.error("[LoveCraft Auth] Callback error:", msg);
        setErrorMsg(msg);
        setStatus("error");
      }
    }

    void handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <BackgroundFX />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel rounded-3xl p-10 md:p-14 w-full max-w-sm text-center relative z-10"
      >
        <Logo className="h-10 mx-auto mb-8" />

        {status === "loading" && (
          <>
            <Loader2 size={40} className="text-gold animate-spin mx-auto mb-5" />
            <h1 className="font-display text-2xl text-ivory">Signing you in…</h1>
            <p className="mt-3 text-ivory/50 text-sm">
              Just a moment while we verify your identity.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Heart size={44} className="text-gold mx-auto mb-5 pulse-heart" fill="currentColor" />
            </motion.div>
            <h1 className="font-display text-2xl text-ivory">Welcome back</h1>
            <p className="mt-3 text-ivory/50 text-sm">Redirecting to your dashboard…</p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle size={44} className="text-destructive mx-auto mb-5" />
            <h1 className="font-display text-2xl text-ivory">Authentication failed</h1>
            <p className="mt-3 text-ivory/50 text-sm">{errorMsg}</p>
            <button
              onClick={() => void navigate({ to: "/login" })}
              className="mt-6 w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#e8c060] via-[#d4af37] to-[#a67b7b] text-charcoal label-caps text-[11px] font-bold"
            >
              Back to Sign In
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
