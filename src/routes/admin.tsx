// ─────────────────────────────────────────────────────────────────
// /admin — Master Admin Console Route
// Dedicated Admin Login & Full Platform Management Suite
// ─────────────────────────────────────────────────────────────────
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/auth.store";
import { Logo } from "@/components/ui/Logo";
import { PromotionalVideosManager } from "@/features/admin/PromotionalVideosManager";
import { AdminSitesManager } from "@/features/admin/AdminSitesManager";
import { AdminUsersManager } from "@/features/admin/AdminUsersManager";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  Film,
  Shield,
  Globe,
  Users,
  ArrowLeft,
  Lock,
  Mail,
  Key,
  LogOut,
  Sparkles,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — LoveCraft.ai" },
      { name: "robots", content: "noindex,nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://lovecraft.ai/admin" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAuthenticated, signInWithPassword, signOut, isLoading: authLoading } = useAuthStore();

  // Admin login form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Tab navigation
  const [activeTab, setActiveTab] = useState<"promo" | "sites" | "users">("promo");

  // Metrics
  const [metrics, setMetrics] = useState({
    totalSites: 0,
    activePromos: 0,
    totalUsers: 0,
    totalImpressions: 0,
  });

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  // Load platform stats metrics
  useEffect(() => {
    if (!isAdmin || !isSupabaseConfigured) return;

    const fetchMetrics = async () => {
      try {
        const [{ count: sitesCount }, { count: promoCount }, { count: usersCount }, { count: eventsCount }] =
          await Promise.all([
            supabase.from("websites").select("*", { count: "exact", head: true }),
            supabase.from("promotional_videos").select("*", { count: "exact", head: true }).eq("is_active", true),
            supabase.from("users").select("*", { count: "exact", head: true }),
            supabase.from("promotional_video_events").select("*", { count: "exact", head: true }),
          ]);

        setMetrics({
          totalSites: sitesCount || 0,
          activePromos: promoCount || 0,
          totalUsers: usersCount || 0,
          totalImpressions: eventsCount || 0,
        });
      } catch {
        // Silent fallback for metrics
      }
    };

    void fetchMetrics();
  }, [isAdmin]);

  const handleAdminLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      await signInWithPassword(email.trim(), password);

      // Check role after login
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role !== "admin" && currentUser?.role !== "superadmin") {
        setLoginError("Account does not have administrator privileges.");
        toast.error("Administrator access required");
      } else {
        toast.success("Welcome to Admin Console!");
      }
    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials");
      toast.error("Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Render Admin Login Screen if not logged in as Admin ─────────
  if (!authLoading && (!isAuthenticated || !isAdmin)) {
    return (
      <div className="min-h-screen bg-charcoal text-ivory flex flex-col justify-between p-6">
        {/* Top Header */}
        <header className="flex items-center justify-between max-w-7xl mx-auto w-full py-4">
          <Link to="/" className="flex items-center">
            <Logo className="h-8 md:h-10" />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-ivory/20 text-ivory/70 hover:text-ivory label-caps text-xs transition-all"
          >
            <ArrowLeft size={12} /> Back to Website
          </Link>
        </header>

        {/* Admin Login Card */}
        <div className="max-w-md w-full mx-auto my-auto py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 md:p-10 rounded-3xl border border-gold/30 shadow-2xl bg-charcoal space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gold/20 border border-gold/40 grid place-items-center mx-auto text-gold mb-4">
                <Shield size={24} />
              </div>
              <h1 className="font-display text-3xl text-ivory">Admin Portal</h1>
              <p className="text-ivory/60 text-xs">
                Enter your administrator credentials to access the LoveCraft.ai control console.
              </p>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs label-caps text-ivory/70 mb-1.5">Admin Email ID</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ivory/40" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@lovecraft.ai"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-ivory/5 border border-ivory/15 text-ivory text-sm focus:border-gold outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs label-caps text-ivory/70 mb-1.5">Admin Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ivory/40" size={16} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-ivory/5 border border-ivory/15 text-ivory text-sm focus:border-gold outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 rounded-full bg-gold text-charcoal font-bold text-xs label-caps hover:bg-gold-light transition-all shadow-lg shadow-gold/20 flex items-center justify-center gap-2 mt-2"
              >
                {loginLoading ? "Authenticating..." : "Unlock Admin Console ✦"}
              </button>
            </form>

            {isAuthenticated && !isAdmin && (
              <div className="pt-2 text-center">
                <p className="text-xs text-rose-400 mb-2">
                  Logged in as {user?.email} (Role: {user?.role}). This account is not an admin.
                </p>
                <button
                  onClick={() => void signOut()}
                  className="text-xs label-caps text-ivory/50 hover:text-ivory underline"
                >
                  Sign Out to Switch Account
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="text-center text-ivory/30 text-xs label-caps py-4">
          © 2026 LoveCraft.ai · Master Admin Console
        </footer>
      </div>
    );
  }

  // ── Render Authenticated Master Admin Console ───────────────────
  return (
    <div className="min-h-screen bg-charcoal text-ivory flex flex-col">
      {/* Admin Top Navigation */}
      <header className="border-b border-ivory/10 bg-charcoal/90 backdrop-blur-xl px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center">
            <Logo className="h-8 md:h-10" />
          </Link>

          <span className="px-3.5 py-1.5 rounded-full bg-gold/20 border border-gold/40 text-gold label-caps text-[10px] font-bold flex items-center gap-1.5 shadow-md">
            <Shield size={12} /> Master Admin Suite
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-ivory/5 border border-ivory/10 text-ivory/70">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="truncate max-w-[180px]">{user?.email}</span>
          </div>

          <button
            onClick={() => void signOut()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 label-caps text-xs transition-all"
            title="Sign Out"
          >
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Admin Console */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 space-y-8">
        {/* Executive Platform Metric Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-ivory/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold/20 border border-gold/30 grid place-items-center text-gold shrink-0">
              <Film size={20} />
            </div>
            <div>
              <div className="text-[10px] label-caps text-ivory/50">Active Promo Ads</div>
              <div className="text-2xl font-bold font-display text-ivory">{metrics.activePromos}</div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-ivory/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 grid place-items-center text-sky-400 shrink-0">
              <Globe size={20} />
            </div>
            <div>
              <div className="text-[10px] label-caps text-ivory/50">Published Sites</div>
              <div className="text-2xl font-bold font-display text-ivory">{metrics.totalSites}</div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-ivory/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 grid place-items-center text-purple-400 shrink-0">
              <Users size={20} />
            </div>
            <div>
              <div className="text-[10px] label-caps text-ivory/50">User Accounts</div>
              <div className="text-2xl font-bold font-display text-ivory">{metrics.totalUsers}</div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-ivory/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 grid place-items-center text-emerald-400 shrink-0">
              <BarChart3 size={20} />
            </div>
            <div>
              <div className="text-[10px] label-caps text-ivory/50">Ad Impressions</div>
              <div className="text-2xl font-bold font-display text-ivory">{metrics.totalImpressions}</div>
            </div>
          </div>
        </div>

        {/* Master Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-ivory/10 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("promo")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold label-caps flex items-center gap-2 transition-all ${
              activeTab === "promo"
                ? "bg-gold text-charcoal shadow-lg shadow-gold/20"
                : "text-ivory/60 hover:text-ivory hover:bg-ivory/5"
            }`}
          >
            <Film size={14} /> Promotional Showcase Ads
          </button>

          <button
            onClick={() => setActiveTab("sites")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold label-caps flex items-center gap-2 transition-all ${
              activeTab === "sites"
                ? "bg-gold text-charcoal shadow-lg shadow-gold/20"
                : "text-ivory/60 hover:text-ivory hover:bg-ivory/5"
            }`}
          >
            <Globe size={14} /> Published Websites
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold label-caps flex items-center gap-2 transition-all ${
              activeTab === "users"
                ? "bg-gold text-charcoal shadow-lg shadow-gold/20"
                : "text-ivory/60 hover:text-ivory hover:bg-ivory/5"
            }`}
          >
            <Users size={14} /> Registered User Accounts
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === "promo" && <PromotionalVideosManager />}
        {activeTab === "sites" && <AdminSitesManager />}
        {activeTab === "users" && <AdminUsersManager />}
      </main>

      {/* Footer */}
      <footer className="border-t border-ivory/10 py-6 text-center text-ivory/30 text-xs label-caps mt-12">
        © 2026 LoveCraft.ai · Executive Admin Control Console
      </footer>
    </div>
  );
}
