// ─────────────────────────────────────────────────────────────────
// SitePreviewModal — Live iframe website preview modal
// ─────────────────────────────────────────────────────────────────
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, RefreshCw } from "lucide-react";
import { useState } from "react";
import type { PublishedSite } from "@/types";

interface SitePreviewModalProps {
  site: PublishedSite | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SitePreviewModal({ site, isOpen, onClose }: SitePreviewModalProps) {
  const [iframeKey, setIframeKey] = useState(0);

  if (!isOpen || !site) return null;

  const liveUrl = site.html_url || `${window.location.origin}/sites/${site.id}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-charcoal/90 backdrop-blur-lg"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="glass-panel rounded-3xl w-full max-w-5xl h-[85vh] relative z-10 overflow-hidden flex flex-col shadow-2xl border border-ivory/20"
        >
          {/* Top Bar */}
          <div className="px-6 py-4 border-b border-ivory/10 flex items-center justify-between bg-charcoal/40">
            <div>
              <h2 className="font-display text-xl text-ivory">{site.title}</h2>
              <p className="label-caps text-ivory/40 text-[10px]">Live Website Preview</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIframeKey((k) => k + 1)}
                className="p-2 rounded-xl text-ivory/40 hover:text-ivory hover:bg-ivory/10 transition-colors"
                title="Reload preview"
              >
                <RefreshCw size={14} />
              </button>
              <a
                href={`/sites/${site.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold hover:bg-gold/25 label-caps text-[10px] transition-all"
              >
                Open Live <ExternalLink size={12} />
              </a>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full grid place-items-center text-ivory/40 hover:text-ivory hover:bg-ivory/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Iframe Viewport */}
          <div className="flex-1 bg-black/60 relative">
            <iframe
              key={iframeKey}
              src={`/sites/${site.id}`}
              className="w-full h-full border-0"
              title={site.title}
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
