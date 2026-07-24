// ─────────────────────────────────────────────────────────────────
// RenameModal — Rename website title modal
// ─────────────────────────────────────────────────────────────────
import { motion, AnimatePresence } from "framer-motion";
import { useState, type FormEvent } from "react";
import { X, Edit3, Loader2 } from "lucide-react";
import type { PublishedSite } from "@/types";

interface RenameModalProps {
  site: PublishedSite | null;
  isOpen: boolean;
  onClose: () => void;
  onRename: (siteId: string, newTitle: string) => Promise<void>;
}

export function RenameModal({ site, isOpen, onClose, onRename }: RenameModalProps) {
  const [title, setTitle] = useState(site?.title ?? "");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !site) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onRename(site.id, title.trim());
      onClose();
    } catch {
      // Handled by caller toast
    } finally {
      setLoading(false);
    }
  };

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
          className="glass-panel rounded-3xl p-6 md:p-8 w-full max-w-md relative z-10 overflow-hidden shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full grid place-items-center text-ivory/40 hover:text-ivory hover:bg-ivory/10 transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gold/15 border border-gold/30 grid place-items-center text-gold">
              <Edit3 size={18} />
            </div>
            <div>
              <h2 className="font-display text-2xl text-ivory">Rename Website</h2>
              <p className="label-caps text-ivory/50 text-[10px] mt-0.5">Update title for display & previews</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="gold-underline-label">Website Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Romeo & Juliet"
                className="gold-underline-input text-lg font-display"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="flex-1 py-3 rounded-2xl bg-gold text-charcoal font-bold label-caps text-[11px] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Save New Title"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl border border-ivory/20 text-ivory/70 hover:text-ivory label-caps text-[11px]"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
