// ─────────────────────────────────────────────────────────────────
// SiteCard — Dashboard card for a published site
// ─────────────────────────────────────────────────────────────────
import { motion } from "framer-motion";
import {
  Copy,
  ExternalLink,
  Eye,
  Trash2,
  Globe,
  Lock,
  Check,
  MoreHorizontal,
  Download,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { PublishedSite } from "@/types";
import { THEMES } from "@/lib/themes";

interface SiteCardProps {
  site: PublishedSite;
  onDelete: (id: string) => void;
}

export function SiteCard({ site, onDelete }: SiteCardProps) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const liveUrl = `${appUrl}/sites/${site.id}`;

  // Find theme gradient for thumbnail preview
  const themeId = (site as unknown as Record<string, unknown>).theme_id as string | undefined;
  const theme = THEMES[themeId ?? "cosmic"] ?? THEMES.cosmic;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(liveUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleDelete = () => {
    if (confirm("Delete this site? This cannot be undone.")) {
      onDelete(site.id);
      toast.success("Site deleted");
    }
  };

  const formattedDate = new Date(site.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel rounded-2xl overflow-hidden group"
    >
      {/* Thumbnail */}
      <div className="h-36 relative overflow-hidden" style={{ background: theme.gradient }}>
        <div className="absolute inset-0 flex items-end p-4">
          <div>
            <p className="font-display text-xl text-ivory leading-tight">{site.title}</p>
            <p className="label-caps text-ivory/50 text-[10px] mt-1">{theme.name}</p>
          </div>
        </div>
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          {site.is_public ? (
            <span className="flex items-center gap-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded-full px-2 py-0.5 label-caps text-[9px]">
              <Globe size={8} /> Public
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-ivory/10 border border-ivory/20 text-ivory/50 rounded-full px-2 py-0.5 label-caps text-[9px]">
              <Lock size={8} /> Private
            </span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
        {/* Stats row */}
        <div className="flex items-center gap-4 mb-4">
          <span className="flex items-center gap-1.5 text-ivory/50 text-sm">
            <Eye size={13} className="text-gold" />
            {(site.views ?? 0).toLocaleString()} views
          </span>
          <span className="text-ivory/30 text-xs">{formattedDate}</span>
        </div>

        {/* URL */}
        <div className="flex items-center gap-2 bg-ivory/5 rounded-xl px-3 py-2 mb-4">
          <span className="flex-1 text-ivory/40 font-mono text-[11px] truncate">
            /sites/{site.id}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyLink}
            className="flex-1 flex items-center justify-center gap-1.5 border border-gold/30 hover:border-gold bg-gold/5 hover:bg-gold/15 rounded-xl py-2 text-gold label-caps text-[10px] transition-all"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 border border-ivory/15 hover:border-ivory/40 bg-ivory/5 hover:bg-ivory/10 rounded-xl py-2 text-ivory/70 hover:text-ivory label-caps text-[10px] transition-all"
          >
            <ExternalLink size={12} />
            Open
          </a>
          {/* More actions dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-9 h-9 flex items-center justify-center border border-ivory/15 hover:border-ivory/40 rounded-xl text-ivory/50 hover:text-ivory transition-all"
            >
              <MoreHorizontal size={14} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 bottom-full mb-1 z-20 glass-panel rounded-xl py-1 min-w-[140px] shadow-2xl">
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-ivory/70 hover:text-ivory hover:bg-ivory/5 text-sm w-full transition-colors"
                  >
                    <ExternalLink size={13} /> View Site
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(liveUrl);
                      setMenuOpen(false);
                      toast.success("Copied!");
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-ivory/70 hover:text-ivory hover:bg-ivory/5 text-sm w-full transition-colors text-left"
                  >
                    <Download size={13} /> Copy Link
                  </button>
                  <div className="h-px bg-ivory/10 my-1" />
                  <button
                    onClick={() => {
                      handleDelete();
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-destructive hover:bg-destructive/10 text-sm w-full transition-colors text-left"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
