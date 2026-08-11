// ─────────────────────────────────────────────────────────────────
// /admin — Admin Dashboard Route
// Protected route for site administrators & superadmins
// ─────────────────────────────────────────────────────────────────
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth.store";
import { Logo } from "@/components/ui/Logo";
import { PromotionalVideosManager } from "@/features/admin/PromotionalVideosManager";
import { Film, Shield, Globe, Users, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const { isAuthenticated, user, isLoading } = useAuthStore.getState();
    if (!isLoading) {
      if (!isAuthenticated) {
        throw redirect({ to: "/login" });
      }
      const role = user?.role ?? "user";
      if (role !== "admin" && role !== "superadmin") {
        throw redirect({ to: "/dashboard" });
      }
    }
  },
  head: () => ({
    meta: [
      { title: "Admin Dashboard — LoveCraft.ai" },
      { name: "robots", content: "noindex,nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://lovecraft.ai/admin" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"promo" | "sites" | "users">("promo");

  return (
    <div className="min-h-screen bg-charcoal text-ivory flex flex-col">
      {/* Admin Top Navigation */}
      <header className="border-b border-ivory/10 bg-charcoal/80 backdrop-blur-xl px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-8" />
          </Link>

          <span className="px-3 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold label-caps text-[10px] font-bold flex items-center gap-1">
            <Shield size={12} /> Admin Console
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-ivory/60 hidden sm:inline">Logged in as {user?.email}</span>
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-ivory/20 text-ivory/80 hover:text-ivory hover:border-ivory/40 transition-all label-caps"
          >
            <ArrowLeft size={12} /> User Dashboard
          </Link>
        </div>
      </header>

      {/* Main Admin Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 space-y-8">
        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-ivory/10 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("promo")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold label-caps flex items-center gap-2 transition-all ${
              activeTab === "promo"
                ? "bg-gold text-charcoal shadow-lg shadow-gold/20"
                : "text-ivory/60 hover:text-ivory hover:bg-ivory/5"
            }`}
          >
            <Film size={14} /> Promotional Videos
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "promo" && <PromotionalVideosManager />}
      </main>
    </div>
  );
}
