// ─────────────────────────────────────────────────────────────────
// AdminSitesManager — Admin Published Sites Controller
// ─────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Globe, Trash2, ExternalLink, Search, Eye, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { PublishedSite } from "@/types";

export function AdminSitesManager() {
  const [sites, setSites] = useState<PublishedSite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [previewSite, setPreviewSite] = useState<PublishedSite | null>(null);

  const loadSites = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setSites([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("websites")
        .select("*, users(email, name)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        toast.error("Failed to load published sites");
      } else {
        setSites((data || []) as PublishedSite[]);
      }
    } catch {
      toast.error("Error loading sites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSites();
  }, []);

  const handleDeleteSite = async (siteId: string, title: string) => {
    if (!confirm(`Are you sure you want to take down "${title}"?`)) return;

    try {
      const { error } = await supabase
        .from("websites")
        .update({ status: "deleted" })
        .eq("id", siteId);

      if (error) throw error;
      toast.success("Site taken down successfully");
      void loadSites();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete site");
    }
  };

  const filteredSites = sites.filter((site) => {
    const q = search.toLowerCase();
    return (
      site.title?.toLowerCase().includes(q) ||
      site.slug?.toLowerCase().includes(q) ||
      site.website_type?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-ivory/10">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="text-gold" size={24} />
            <h2 className="font-display text-2xl text-ivory">Published Websites ({sites.length})</h2>
          </div>
          <p className="text-ivory/60 text-xs mt-1">
            Monitor and manage all user-created published websites across LoveCraft.ai.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/40" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search site title or slug..."
              className="w-full pl-9 pr-4 py-2 rounded-full bg-ivory/5 border border-ivory/10 text-xs text-ivory outline-none focus:border-gold"
            />
          </div>

          <button
            onClick={() => void loadSites()}
            className="p-2.5 rounded-full bg-ivory/5 hover:bg-ivory/15 text-ivory/70 hover:text-ivory transition-all"
            title="Refresh list"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Sites List */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="animate-spin text-gold mx-auto mb-3" size={32} />
          <p className="text-ivory/50 text-xs label-caps">Loading published websites...</p>
        </div>
      ) : filteredSites.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-ivory/10">
          <Globe className="text-ivory/20 mx-auto mb-4" size={48} />
          <h3 className="font-display text-xl text-ivory mb-1">No Published Sites Found</h3>
          <p className="text-ivory/60 text-xs">
            {search ? "No sites matching your search term." : "User-published sites will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map((site) => (
            <motion.div
              key={site.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-3xl overflow-hidden border border-ivory/10 flex flex-col justify-between group hover:border-gold/30 transition-all"
            >
              <div className="relative aspect-video bg-charcoal overflow-hidden">
                <img
                  src={
                    site.preview_image ||
                    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80"
                  }
                  alt={site.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full label-caps text-[9px] font-bold ${
                      site.status === "active"
                        ? "bg-emerald-500/90 text-white"
                        : "bg-rose-500/90 text-white"
                    }`}
                  >
                    {site.status}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-charcoal/80 text-gold border border-gold/30 label-caps text-[9px]">
                    {site.website_type || "Love"}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 text-[10px] label-caps text-ivory/70 bg-charcoal/70 px-2 py-0.5 rounded-full backdrop-blur">
                  Views: {((site as unknown as Record<string, unknown>).view_count as number) || 0}
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-lg text-ivory group-hover:text-gold transition-colors truncate">
                    {site.title}
                  </h3>
                  <p className="text-ivory/50 text-[11px] font-mono truncate mt-0.5">
                    /sites/{site.id}
                  </p>
                  <p className="text-ivory/40 text-[10px] mt-2">
                    Created {new Date(site.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-ivory/10">
                  <a
                    href={`/sites/${site.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs label-caps text-gold hover:underline"
                  >
                    <span>View Site</span>
                    <ExternalLink size={12} />
                  </a>

                  <button
                    onClick={() => void handleDeleteSite(site.id, site.title)}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all"
                    title="Take Down Site"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
