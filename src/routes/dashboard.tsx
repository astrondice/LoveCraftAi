// ─────────────────────────────────────────────────────────────────
// /dashboard — User's published sites management dashboard
// Matches LoveCraft.ai glass aesthetic perfectly
// ─────────────────────────────────────────────────────────────────
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth.store";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, lazy, Suspense } from "react";
import { BackgroundFX } from "@/components/animations/BackgroundFX";
import { SiteCard } from "@/features/dashboard/SiteCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { QuotaBadge } from "@/components/ui/QuotaBadge";

// Lazy-loaded modal components for code splitting & bundle optimization
const AnalyticsModal = lazy(() =>
  import("@/features/dashboard/AnalyticsModal").then((m) => ({ default: m.AnalyticsModal }))
);
const SitePreviewModal = lazy(() =>
  import("@/features/dashboard/SitePreviewModal").then((m) => ({ default: m.SitePreviewModal }))
);
const RenameModal = lazy(() =>
  import("@/features/dashboard/RenameModal").then((m) => ({ default: m.RenameModal }))
);
const TrashBinModal = lazy(() =>
  import("@/features/dashboard/TrashBinModal").then((m) => ({ default: m.TrashBinModal }))
);
const ExportModal = lazy(() =>
  import("@/features/dashboard/ExportModal").then((m) => ({ default: m.ExportModal }))
);
const PublishHistoryModal = lazy(() =>
  import("@/features/dashboard/PublishHistoryModal").then((m) => ({ default: m.PublishHistoryModal }))
);
const PublishModal = lazy(() =>
  import("@/features/publish/PublishModal").then((m) => ({ default: m.PublishModal }))
);
import { useAuth } from "@/hooks/use-auth";
import { publishService } from "@/services/publish.service";
import { useLovecraft } from "@/lib/store";
import type { PublishedSite, PublishInput } from "@/types";
import { LayoutDashboard, Globe, Plus, Sparkles, Heart, LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import { MagneticButton } from "@/components/ui/MagneticButton";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const { isAuthenticated, isLoading } = useAuthStore.getState();
    if (!isLoading && !isAuthenticated) {
      throw redirect({ to: "/login", search: { redirect: "/dashboard" } });
    }
  },
  head: () => ({
    meta: [{ title: "My Sites — LoveCraft AI" }, { name: "robots", content: "noindex" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, signOut } = useAuth();
  const lovecraftStore = useLovecraft();

  const [sites, setSites] = useState<PublishedSite[]>([]);
  const [loadingSites, setLoadingSites] = useState(true);

  // Modals state
  const [analyticsSite, setAnalyticsSite] = useState<PublishedSite | null>(null);
  const [previewSite, setPreviewSite] = useState<PublishedSite | null>(null);
  const [republishSite, setRepublishSite] = useState<PublishedSite | null>(null);
  const [renameSiteObj, setRenameSiteObj] = useState<PublishedSite | null>(null);
  const [exportSiteObj, setExportSiteObj] = useState<PublishedSite | null>(null);
  const [historySiteObj, setHistorySiteObj] = useState<PublishedSite | null>(null);
  const [showTrashBin, setShowTrashBin] = useState(false);

  const loadSites = async () => {
    setLoadingSites(true);
    try {
      const data = await publishService.getUserSites();
      // Ensure newest website appears first
      const sorted = [...data].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setSites(sorted);
    } catch {
      toast.error("Failed to load your sites");
    } finally {
      setLoadingSites(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
      toast.success("Site deleted successfully");
    } catch {
      toast.error("Failed to delete site");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      toast.loading("Duplicating website…", { id: "dup" });
      const dup = await publishService.duplicateSite(id);
      setSites((prev) => [dup, ...prev]);
      toast.success("Website duplicated!", { id: "dup" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Duplication failed", { id: "dup" });
    }
  };

  const handleEdit = (site: PublishedSite) => {
    // Populate store with website blueprint data and navigate to editor
    const bp = (site.blueprint_json ?? {}) as Record<string, unknown>;
    const names = site.title.split("&");
    if (names[0]) lovecraftStore.setField("name1", names[0].trim());
    if (names[1]) lovecraftStore.setField("name2", names[1].trim());
    if (site.website_type) lovecraftStore.setTheme(site.website_type);
    lovecraftStore.setStep(0);
    void navigate({ to: "/generate" });
  };

  const handleRename = async (siteId: string, newTitle: string) => {
    try {
      await publishService.renameSite(siteId, newTitle);
      setSites((prev) =>
        prev.map((s) => (s.id === siteId ? { ...s, title: newTitle } : s)),
      );
      toast.success("Website renamed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rename failed");
      throw err;
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setSites([]);
  };

  // Input for Republish Modal
  const republishInput: PublishInput | null = republishSite
    ? {
        name1: republishSite.title.split("&")[0]?.trim() ?? "You",
        name2: republishSite.title.split("&")[1]?.trim() ?? "Them",
        date: "",
        duration: "",
        memory: "",
        message: "",
        themeId: republishSite.website_type || "cosmic",
        photos: republishSite.preview_image
          ? [{ name: "photo-0", dataUrl: republishSite.preview_image }]
          : [],
        music: null,
        video: null,
        projectId: republishSite.id,
      }
    : null;

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
            <span className="label-caps text-ivory/80 text-[10px]">My Websites</span>
          </div>

          <div className="flex items-center gap-3">
            <QuotaBadge />
            <button
              onClick={() => setShowTrashBin(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-ivory/5 border border-ivory/10 hover:border-ivory/30 text-ivory/70 hover:text-ivory label-caps text-[10px] transition-all"
              title="Open Trash Bin"
            >
              <Trash2 size={12} className="text-destructive/80" /> Trash Bin
            </button>
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
                <span className="hidden md:block text-ivory/60 text-sm font-medium">
                  {user.name ?? user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-ivory/40 hover:text-ivory transition-colors p-1"
                  title="Sign out"
                >
                  <LogOut size={15} />
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
          <span className="label-caps text-gold">My Websites</span>
          <h1 className="font-display text-4xl md:text-6xl text-ivory mt-3">
            Published <span className="italic gold-shimmer">Love Stories</span>
          </h1>
          <p className="mt-4 text-ivory/60 max-w-xl">
            Every love story you've published lives here. Share, edit, duplicate, and track live analytics.
          </p>
        </motion.div>

        {/* Action bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Globe size={16} className="text-gold" />
            <span className="text-ivory/70 text-sm font-medium">
              {sites.length} website{sites.length !== 1 ? "s" : ""}
            </span>
          </div>
          <Link to="/generate">
            <MagneticButton variant="gold">
              <Plus size={14} /> Create New Website
            </MagneticButton>
          </Link>
        </div>

        {/* Loading skeletons */}
        {(authLoading || loadingSites) && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        <AnimatePresence>
          {!authLoading && !loadingSites && isAuthenticated && sites.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-32 glass-panel rounded-3xl p-12 max-w-2xl mx-auto"
            >
              <Sparkles className="text-gold mx-auto mb-4" size={48} />
              <h2 className="font-display text-3xl text-ivory mb-3">No websites created yet</h2>
              <p className="text-ivory/50 mb-8 max-w-md mx-auto">
                Craft an unforgettable cinematic love website in minutes. Your created websites will appear here.
              </p>
              <Link to="/generate">
                <MagneticButton variant="gold">
                  <Plus size={14} /> Create Your First Website
                </MagneticButton>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sites grid (Newest first) */}
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
                  transition={{ delay: i * 0.05 }}
                >
                  <SiteCard
                    site={site}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                    onEdit={handleEdit}
                    onPreview={(s) => setPreviewSite(s)}
                    onAnalytics={(s) => setAnalyticsSite(s)}
                    onPublish={(s) => setRepublishSite(s)}
                    onRename={(s) => setRenameSiteObj(s)}
                    onExport={(s) => setExportSiteObj(s)}
                    onHistory={(s) => setHistorySiteObj(s)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lazy-loaded Modals Wrapped in Suspense */}
      <Suspense fallback={null}>
        {/* Analytics Modal */}
        <AnalyticsModal
          site={analyticsSite}
          isOpen={!!analyticsSite}
          onClose={() => setAnalyticsSite(null)}
        />

        {/* Site Preview Modal */}
        <SitePreviewModal
          site={previewSite}
          isOpen={!!previewSite}
          onClose={() => setPreviewSite(null)}
        />

        {/* Rename Modal */}
        <RenameModal
          site={renameSiteObj}
          isOpen={!!renameSiteObj}
          onClose={() => setRenameSiteObj(null)}
          onRename={handleRename}
        />

        {/* Export Modal */}
        <ExportModal
          site={exportSiteObj}
          isOpen={!!exportSiteObj}
          onClose={() => setExportSiteObj(null)}
        />

        {/* Publish History Modal */}
        <PublishHistoryModal
          site={historySiteObj}
          isOpen={!!historySiteObj}
          onClose={() => setHistorySiteObj(null)}
          onRollbackComplete={loadSites}
        />

        {/* Trash Bin Modal */}
        <TrashBinModal
          isOpen={showTrashBin}
          onClose={() => setShowTrashBin(false)}
          onRestored={loadSites}
        />

        {/* Republish Modal */}
        {republishInput && (
          <PublishModal
            isOpen={!!republishSite}
            onClose={() => setRepublishSite(null)}
            input={republishInput}
          />
        )}
      </Suspense>
    </div>
  );
}
