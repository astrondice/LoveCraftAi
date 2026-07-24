// ─────────────────────────────────────────────────────────────────
// ExportModal — One-click website export modal (ZIP, HTML, React, Next.js)
// ─────────────────────────────────────────────────────────────────
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Download, FileCode, Archive, Code2, Loader2 } from "lucide-react";
import { exportService, type ExportFormat } from "@/services/export.service";
import { publishService } from "@/services/publish.service";
import type { PublishedSite } from "@/types";
import { toast } from "sonner";

interface ExportModalProps {
  site: PublishedSite | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ site, isOpen, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>("zip");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !site) return null;

  const handleExport = async () => {
    setLoading(true);
    try {
      toast.loading("Preparing export package…", { id: "exp" });
      const res = await publishService.getSite(site.id);
      const html = res?.html ?? "<html><body><h1>Love Story</h1></body></html>";
      await exportService.exportSite(site, html, format);
      toast.success("Export downloaded successfully!", { id: "exp" });
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed", { id: "exp" });
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
              <Download size={20} />
            </div>
            <div>
              <h2 className="font-display text-2xl text-ivory">Export Website</h2>
              <p className="label-caps text-gold text-[10px] mt-0.5">{site.title}</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => setFormat("zip")}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                format === "zip"
                  ? "bg-gold/15 border-gold text-ivory"
                  : "bg-ivory/5 border-ivory/10 text-ivory/60 hover:text-ivory"
              }`}
            >
              <Archive size={20} className={format === "zip" ? "text-gold" : ""} />
              <div>
                <p className="font-semibold text-sm">Static ZIP Bundle (.zip)</p>
                <p className="text-ivory/40 text-xs">HTML, CSS, JS & Readme package</p>
              </div>
            </button>

            <button
              onClick={() => setFormat("html")}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                format === "html"
                  ? "bg-gold/15 border-gold text-ivory"
                  : "bg-ivory/5 border-ivory/10 text-ivory/60 hover:text-ivory"
              }`}
            >
              <FileCode size={20} className={format === "html" ? "text-gold" : ""} />
              <div>
                <p className="font-semibold text-sm">Single HTML File (.html)</p>
                <p className="text-ivory/40 text-xs">Standalone, self-contained website</p>
              </div>
            </button>

            <button
              onClick={() => setFormat("react")}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                format === "react"
                  ? "bg-gold/15 border-gold text-ivory"
                  : "bg-ivory/5 border-ivory/10 text-ivory/60 hover:text-ivory"
              }`}
            >
              <Code2 size={20} className={format === "react" ? "text-gold" : ""} />
              <div>
                <p className="font-semibold text-sm">React / Next.js Component (.jsx)</p>
                <p className="text-ivory/40 text-xs">Embed directly into any React web app</p>
              </div>
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={loading}
              className="flex-1 py-3 rounded-2xl bg-gold text-charcoal font-bold label-caps text-[11px] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Download Export
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border border-ivory/20 text-ivory/70 hover:text-ivory label-caps text-[11px]"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
