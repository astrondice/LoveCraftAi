// ─────────────────────────────────────────────────────────────────
// TrashBinModal — Modal for viewing, restoring, and purging trashed sites
// ─────────────────────────────────────────────────────────────────
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { X, Trash2, RotateCcw, AlertTriangle, Loader2 } from "lucide-react";
import { publishService } from "@/services/publish.service";
import type { PublishedSite } from "@/types";
import { toast } from "sonner";

interface TrashBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestored: () => void;
}

export function TrashBinModal({ isOpen, onClose, onRestored }: TrashBinModalProps) {
  const [trashedSites, setTrashedSites] = useState<PublishedSite[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrash = async () => {
    setLoading(true);
    try {
      const sites = await publishService.getTrashedSites();
      setTrashedSites(sites);
    } catch {
      toast.error("Failed to load trash bin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) void loadTrash();
  }, [isOpen]);

  const handleRestore = async (siteId: string) => {
    try {
      await publishService.restoreSite(siteId);
      setTrashedSites((prev) => prev.filter((s) => s.id !== siteId));
      toast.success("Website restored!");
      onRestored();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Restore failed");
    }
  };

  const handlePermanentDelete = async (siteId: string) => {
    if (confirm("Permanently delete this website? This action cannot be undone.")) {
      try {
        await publishService.permanentDeleteSite(siteId);
        setTrashedSites((prev) => prev.filter((s) => s.id !== siteId));
        toast.success("Website permanently deleted");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Deletion failed");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-charcoal/85 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3 }}
          className="glass-panel rounded-3xl p-6 md:p-8 w-full max-w-xl relative z-10 overflow-hidden shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full grid place-items-center text-ivory/40 hover:text-ivory hover:bg-ivory/10 transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-destructive/15 border border-destructive/30 grid place-items-center text-destructive">
              <Trash2 size={20} />
            </div>
            <div>
              <h2 className="font-display text-2xl text-ivory">Trash Bin</h2>
              <p className="label-caps text-ivory/50 text-[10px] mt-0.5">30-day retention before automatic permanent deletion</p>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <Loader2 size={32} className="text-gold animate-spin mx-auto mb-3" />
              <p className="text-ivory/50 text-sm">Loading trash bin…</p>
            </div>
          ) : trashedSites.length === 0 ? (
            <div className="py-16 text-center">
              <Trash2 size={40} className="text-ivory/20 mx-auto mb-3" />
              <p className="font-display text-xl text-ivory/70">Trash bin is empty</p>
              <p className="text-ivory/40 text-xs mt-1">Deleted websites will appear here for 30 days.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {trashedSites.map((site) => (
                <div
                  key={site.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-ivory/5 border border-ivory/10"
                >
                  <div>
                    <p className="font-display text-lg text-ivory leading-tight">{site.title}</p>
                    <p className="text-ivory/40 text-xs mt-0.5">
                      Deleted {new Date(site.updated_at || site.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRestore(site.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold/15 border border-gold/30 text-gold hover:bg-gold/25 label-caps text-[10px] transition-all"
                    >
                      <RotateCcw size={12} /> Restore
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(site.id)}
                      className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                      title="Permanently delete"
                    >
                      <AlertTriangle size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
