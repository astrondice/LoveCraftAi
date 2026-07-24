// ─────────────────────────────────────────────────────────────────
// /login — Standalone sign-in page
// ─────────────────────────────────────────────────────────────────
import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { Mail, Github, Loader2, Heart, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { BackgroundFX } from "@/components/animations/BackgroundFX";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth.store";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: loginSearchSchema,
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const { isAuthenticated, isLoading } = useAuthStore.getState();
    if (!isLoading && isAuthenticated) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [{ title: "Sign In — LoveCraft AI" }, { name: "robots", content: "noindex" }],
  }),
  component: LoginPage,
});

type Tab = "signin" | "magic" | "signup";

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { signInWithOAuth, signInWithPassword, sendMagicLink } = useAuth();

  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const destination = search.redirect ?? "/dashboard";

  const handle = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      // fn() resolved with authenticated store state — safe to navigate
      console.log("[LoveCraft Auth] Login: navigating to", destination);
      void navigate({ to: destination as "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false); // only reset on error; success stays busy until navigation
    }
  };

  const handleOAuth = (provider: "google" | "github") => {
    console.log("[LoveCraft Auth] OAuth button clicked:", provider);
    // signInWithOAuth redirects the browser to the provider.
    // The page stays busy — user navigates away. No navigate() needed here.
    setBusy(true);
    signInWithOAuth(provider).catch((err) => {
      toast.error(err instanceof Error ? err.message : "OAuth failed");
      setBusy(false);
    });
  };

  const handleMagicLink = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await sendMagicLink(email);
      setMagicSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSignIn = async (e: FormEvent) => {
    e.preventDefault();
    void handle(() => signInWithPassword(email, password));
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
            Welcome <span className="italic gold-shimmer">back</span>
          </h1>
          <p className="mt-2 text-ivory/50 text-sm">Your love story, forever yours.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-full border border-ivory/15 p-1 mb-7 bg-ivory/5">
          {(["signin", "magic"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setMagicSent(false);
              }}
              className={`flex-1 rounded-full py-2 text-[11px] font-semibold uppercase tracking-widest transition-all ${
                tab === t ? "bg-gold text-charcoal" : "text-ivory/50 hover:text-ivory"
              }`}
            >
              {t === "signin" ? "Password" : "Magic Link"}
            </button>
          ))}
        </div>

        {/* OAuth */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleOAuth("google")}
            disabled={busy}
            className="w-full flex items-center justify-center gap-3 border border-ivory/20 hover:border-ivory/50 hover:bg-ivory/5 rounded-2xl py-3.5 text-ivory/80 hover:text-ivory transition-all label-caps text-[11px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            Continue with Google
          </button>
          <button
            onClick={() => handleOAuth("github")}
            disabled={busy}
            className="w-full flex items-center justify-center gap-3 border border-ivory/20 hover:border-ivory/50 hover:bg-ivory/5 rounded-2xl py-3.5 text-ivory/80 hover:text-ivory transition-all label-caps text-[11px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Github size={18} />
            Continue with GitHub
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-ivory/10" />
          <span className="text-ivory/30 text-xs">or</span>
          <div className="flex-1 h-px bg-ivory/10" />
        </div>

        {/* Magic Link */}
        {tab === "magic" && (
          <div>
            {magicSent ? (
              <div className="text-center py-4">
                <Mail className="text-gold mx-auto mb-3" size={28} />
                <p className="text-ivory font-display text-lg">Check your inbox</p>
                <p className="text-ivory/50 text-sm mt-2">
                  We sent a magic link to <span className="text-gold">{email}</span>
                </p>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-4">
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
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#e8c060] via-[#d4af37] to-[#a67b7b] text-charcoal label-caps text-[11px] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                  Send Magic Link
                </button>
              </form>
            )}
          </div>
        )}

        {/* Password Sign In */}
        {tab === "signin" && (
          <form onSubmit={handleEmailSignIn} className="space-y-4">
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
                placeholder="••••••••"
                className="gold-underline-input"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#e8c060] via-[#d4af37] to-[#a67b7b] text-charcoal label-caps text-[11px] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : "Sign In"}
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-ivory/30 text-sm">
          Don't have an account?{" "}
          <Link
            to="/signup"
            search={{ redirect: destination !== "/dashboard" ? destination : undefined }}
            className="text-gold hover:text-ivory transition-colors"
          >
            Sign up
          </Link>
        </p>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-ivory/20 text-xs">
          <Heart size={10} fill="currentColor" />
          <span>Crafted with love</span>
        </div>
      </motion.div>
    </div>
  );
}
