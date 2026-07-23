// ─────────────────────────────────────────────────────────────────
// /dashboard — User's published sites management dashboard
// Matches LoveCraft.ai glass aesthetic perfectly
// ─────────────────────────────────────────────────────────────────
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth.store";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { BackgroundFX } from "@/components/animations/BackgroundFX";
import { SiteCard } from "@/features/dashboard/SiteCard";
import { useAuth } from "@/hooks/use-auth";
import { publishService } from "@/services/publish.service";
import type { PublishedSite } from "@/types";
import {
  LayoutDashboard,
  Globe,
  Plus,
  Sparkles,
  Heart,
  Loader2,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import { MagneticButton } from "@/components/ui/MagneticButton";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const { isAuthenticated, isLoading } = useAuthStore.getState();
    console.log("[LoveCraft Auth] dashboard beforeLoad — isLoading:", isLoading, "isAuthenticated:", isAuthenticated);
    if (!isLoading && !isAuthenticated) {
      console.log("[LoveCraft Auth] Not authenticated — redirecting to /login");
      throw redirect({ to: "/login", search: { redirect: "/dashboard" } });
    }
  },
  head: () => ({
    meta: [
      { title: "My Sites — LoveCraft AI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, signOut } = useAuth();
  const [sites, setSites] = useState<PublishedSite[]>([]);
  const [loadingSites, setLoadingSites] = useState(true);

  const loadSites = async () => {
    setLoadingSites(true);
    try {
      const data = await publishService.getUserSites();
      setSites(data);
    } catch {
      toast.error("Failed to load your sites");
    } finally {
      setLoadingSites(false);
    }
  };

  // Post-init guard: if auth finishes loading with no user, redirect to /login.
  // This closes the race window where beforeLoad saw isLoading:true and passed.
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("[LoveCraft Auth] Dashboard: auth resolved with no user — redirecting");
      void navigate({ to: "/login", search: { redirect: "/dashboard" } });
      return;
    }
    if (!authLoading && isAuthenticated) {
      void loadSites();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  const handleDelete = async (id: string) => {
    try {
      await publishService.deleteSite(id);
      setSites((prev) => prev.filter((s) => s.id !== id));
    } catch {
      toast.error("Failed to delete site");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setSites([]);
  };

  return (
    <div className="relative min-h-screen pb-20">
      <BackgroundFX />

      {/* Top bar */}
      <div className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-charcoal/50 border-b border-ivory/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo className="h-8 md:h-10" />
          </Link>

          <div className="flex items-center gap-2">
            <LayoutDashboard size={14} className="text-gold" />
            <span className="label-caps text-ivory/80 text-[10px]">My Sites</span>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name ?? user.email}
                    className="w-8 h-8 rounded-full border border-ivory/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 grid place-items-center">
                    <Heart size={14} className="text-gold" />
                  </div>
                )}
                <span className="hidden md:block text-ivory/60 text-sm">
                  {user.name ?? user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-ivory/40 hover:text-ivory transition-colors"
                  title="Sign out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}
  
          </div>
        </div>
      </div>

      <div className="relative z-10 pt-28 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <span className="label-caps text-gold">Your Collection</span>
          <h1 className="font-display text-4xl md:text-6xl text-ivory mt-3">
            Published{" "}
            <span className="italic gold-shimmer">Love Stories</span>
          </h1>
          <p className="mt-4 text-ivory/60 max-w-xl">
            Every love story you've published lives here. Share, manage, and track
            how many hearts you've touched.
          </p>
        </motion.div>

        {/* Action bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Globe size={16} className="text-gold" />
            <span className="text-ivory/60 text-sm">
              {sites.length} site{sites.length !== 1 ? "s" : ""} published
            </span>
          </div>
          <Link to="/generate">
            <MagneticButton variant="gold">
              <Plus size={14} /> Create New
            </MagneticButton>
          </Link>
        </div>

        {/* Loading */}
        {(authLoading || loadingSites) && (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={32} className="text-gold animate-spin" />
          </div>
        )}



        {/* Empty state */}
        <AnimatePresence>
          {!authLoading && !loadingSites && isAuthenticated && sites.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-32"
            >
              <Sparkles className="text-gold mx-auto mb-4" size={44} />
              <h2 className="font-display text-3xl text-ivory mb-3">
                No sites published yet
              </h2>
              <p className="text-ivory/50 mb-8 max-w-md mx-auto">
                Create your first cinematic love website and publish it with one click.
                It'll appear here instantly.
              </p>
              <Link to="/generate">
                <MagneticButton variant="gold">
                  <Plus size={14} /> Create Your First Site
                </MagneticButton>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sites grid */}
        <AnimatePresence>
          {!authLoading && !loadingSites && sites.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {sites.map((site, i) => (
                <motion.div
                  key={site.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <SiteCard site={site} onDelete={handleDelete} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
