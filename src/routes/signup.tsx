// ─────────────────────────────────────────────────────────────────
// /signup — Standalone sign-up page
// ─────────────────────────────────────────────────────────────────
import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { Github, Loader2, Heart, ArrowLeft, Sparkles, Mail } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { BackgroundFX } from "@/components/animations/BackgroundFX";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth.store";

const signupSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/signup")({
  validateSearch: signupSearchSchema,
  beforeLoad: () => {
    const { isAuthenticated, isLoading } = useAuthStore.getState();
    if (!isLoading && isAuthenticated) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Create Account — LoveCraft AI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignupPage,
});

type Method = "password" | "oauth";

function SignupPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { signInWithOAuth, signUp, sendMagicLink } = useAuth();

  const [method, setMethod] = useState<Method>("oauth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [signupDone, setSignupDone] = useState(false);

  const destination = search.redirect ?? "/dashboard";

  const handle = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      void navigate({ to: destination as "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const handleOAuth = (provider: "google" | "github") =>
    handle(() => signInWithOAuth(provider));

  const handleEmailSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signUp(email, password);
      // Supabase sends a confirmation email; show success state
      setSignupDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-20">
      <BackgroundFX />

      {/* Back to home */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-20 flex items-center gap-2 text-ivory/40 hover:text-ivory transition-colors label-caps text-[10px]"
      >
        <ArrowLeft size={14} />
        Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel rounded-3xl p-8 md:p-12 w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Logo className="h-10 mx-auto mb-5" />
          <h1 className="font-display text-3xl md:text-4xl text-ivory">
            Begin your{" "}
            <span className="italic gold-shimmer">story</span>
          </h1>
          <p className="mt-2 text-ivory/50 text-sm">
            Free forever. No credit card required.
          </p>
        </div>

        {signupDone ? (
          /* Confirmation state */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <Mail className="text-gold mx-auto mb-4" size={40} />
            <h2 className="font-display text-2xl text-ivory mb-3">
              Check your inbox
            </h2>
            <p className="text-ivory/50 text-sm">
              We sent a confirmation link to{" "}
              <span className="text-gold">{email}</span>.
              <br />
              Click it to activate your account.
            </p>
            <Link to="/login">
              <button className="mt-8 w-full py-3.5 rounded-2xl border border-ivory/20 text-ivory/60 hover:text-ivory hover:border-ivory/40 transition-all label-caps text-[11px]">
                Back to Sign In
              </button>
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Method toggle */}
            <div className="flex rounded-full border border-ivory/15 p-1 mb-7 bg-ivory/5">
              {(["oauth", "password"] as Method[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`flex-1 rounded-full py-2 text-[11px] font-semibold uppercase tracking-widest transition-all ${
                    method === m
                      ? "bg-gold text-charcoal"
                      : "text-ivory/50 hover:text-ivory"
                  }`}
                >
                  {m === "oauth" ? "Social" : "Email"}
                </button>
              ))}
            </div>

            {/* OAuth */}
            {method === "oauth" && (
              <div className="space-y-3">
                <button
                  onClick={() => handleOAuth("google")}
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-3 border border-ivory/20 hover:border-ivory/50 hover:bg-ivory/5 rounded-2xl py-3.5 text-ivory/80 hover:text-ivory transition-all label-caps text-[11px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  Sign up with Google
                </button>
                <button
                  onClick={() => handleOAuth("github")}
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-3 border border-ivory/20 hover:border-ivory/50 hover:bg-ivory/5 rounded-2xl py-3.5 text-ivory/80 hover:text-ivory transition-all label-caps text-[11px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Github size={18} />
                  Sign up with GitHub
                </button>
              </div>
            )}

            {/* Email + Password */}
            {method === "password" && (
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div>
                  <label className="gold-underline-label">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="gold-underline-input"
                  />
                </div>
                <div>
                  <label className="gold-underline-label">Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="gold-underline-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#e8c060] via-[#d4af37] to-[#a67b7b] text-charcoal label-caps text-[11px] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {busy ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Create Account
                    </>
                  )}
                </button>
              </form>
            )}
          </>
        )}

        {/* Footer */}
        {!signupDone && (
          <p className="mt-8 text-center text-ivory/30 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              search={{ redirect: destination !== "/dashboard" ? destination : undefined }}
              className="text-gold hover:text-ivory transition-colors"
            >
              Sign in
            </Link>
          </p>
        )}

        <div className="mt-6 flex items-center justify-center gap-1.5 text-ivory/20 text-xs">
          <Heart size={10} fill="currentColor" />
          <span>Crafted with love</span>
        </div>
      </motion.div>
    </div>
  );
}
