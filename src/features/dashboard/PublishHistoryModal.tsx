// ─────────────────────────────────────────────────────────────────
// PublishHistoryModal — Deployments history & one-click rollback
// ─────────────────────────────────────────────────────────────────
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { X, History, ExternalLink, RotateCcw, Loader2 } from "lucide-react";
import { publishService, type Deployment } from "@/services/publish.service";
import type { PublishedSite } from "@/types";
import { toast } from "sonner";

interface PublishHistoryModalProps {
  site: PublishedSite | null;
  isOpen: boolean;
  onClose: () => void;
  onRollbackComplete: () => void;
}

export function PublishHistoryModal({
  site,
  isOpen,
  onClose,
  onRollbackComplete,
}: PublishHistoryModalProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !site) return;
    setLoading(true);
    publishService
      .getDeployments(site.id)
      .then((data) => setDeployments(data))
      .catch((err) => console.error("[PublishHistoryModal] error:", err))
      .finally(() => setLoading(false));
  }, [isOpen, site]);

  const handleRollback = async (dep: Deployment) => {
    if (!site) return;
    if (confirm(`Rollback website to Publish #${dep.version_num}?`)) {
      try {
        toast.loading("Rolling back deployment…", { id: "rb" });
        await publishService.rollbackDeployment(site.id, dep.id);
        toast.success(`Rolled back to Publish #${dep.version_num}!`, { id: "rb" });
        onRollbackComplete();
        onClose();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Rollback failed", { id: "rb" });
      }
    }
  };

  if (!isOpen || !site) return null;

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
            <div className="w-10 h-10 rounded-2xl bg-gold/15 border border-gold/30 grid place-items-center text-gold">
              <History size={20} />
            </div>
            <div>
              <h2 className="font-display text-2xl text-ivory">Publish History</h2>
              <p className="label-caps text-gold text-[10px] mt-0.5">{site.title}</p>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <Loader2 size={32} className="text-gold animate-spin mx-auto mb-3" />
              <p className="text-ivory/50 text-sm">Loading deployment history…</p>
            </div>
          ) : deployments.length === 0 ? (
            <div className="py-16 text-center">
              <History size={40} className="text-ivory/20 mx-auto mb-3" />
              <p className="font-display text-xl text-ivory/70">No previous deployments recorded</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {deployments.map((dep, idx) => (
                <div
                  key={dep.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-ivory/5 border border-ivory/10"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg text-ivory">
                        Publish #{dep.version_num}
                      </span>
                      {idx === 0 && (
                        <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full label-caps text-[9px]">
                          Active Live
                        </span>
                      )}
                    </div>
                    <p className="text-ivory/40 text-xs mt-0.5">
                      {new Date(dep.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={dep.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl border border-ivory/15 text-ivory/60 hover:text-ivory transition-all"
                      title="View deployment snapshot"
                    >
                      <ExternalLink size={14} />
                    </a>
                    {idx !== 0 && (
                      <button
                        onClick={() => handleRollback(dep)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold/15 border border-gold/30 text-gold hover:bg-gold/25 label-caps text-[10px] transition-all"
                      >
                        <RotateCcw size={12} /> Rollback
                      </button>
                    )}
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
