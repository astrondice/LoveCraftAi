// ─────────────────────────────────────────────────────────────────
// SiteCard — Dashboard card for a published site
// Supports: Edit, Preview, Publish/Republish, Duplicate, Analytics, Delete, Open Live
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
  CopyPlus,
  BarChart3,
  Edit3,
  Play,
  UploadCloud,
  Download,
  History,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { PublishedSite } from "@/types";
import { THEMES } from "@/lib/themes";
import { SeoScoreBadge } from "@/components/ui/SeoScoreBadge";

interface SiteCardProps {
  site: PublishedSite;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onEdit?: (site: PublishedSite) => void;
  onPreview?: (site: PublishedSite) => void;
  onAnalytics?: (site: PublishedSite) => void;
  onPublish?: (site: PublishedSite) => void;
  onRename?: (site: PublishedSite) => void;
  onExport?: (site: PublishedSite) => void;
  onHistory?: (site: PublishedSite) => void;
}

export function SiteCard({
  site,
  onDelete,
  onDuplicate,
  onEdit,
  onPreview,
  onAnalytics,
  onPublish,
  onRename,
  onExport,
  onHistory,
}: SiteCardProps) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const liveUrl = `${appUrl}/sites/${site.id}`;

  const themeId =
    (site as unknown as Record<string, unknown>).theme_id as string | undefined ??
    site.website_type;
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

  const formattedDate = new Date(site.created_at || site.updated_at).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel rounded-2xl overflow-hidden group flex flex-col justify-between"
    >
      <div>
        {/* Thumbnail Preview header */}
        <div
          className="h-36 relative overflow-hidden cursor-pointer"
          style={{ background: theme.gradient }}
          onClick={() => onPreview?.(site)}
        >
          {site.preview_image || site.og_image_url ? (
            <img
              src={site.preview_image || site.og_image_url || ""}
              alt={site.title}
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="flex items-center gap-1 bg-charcoal/60 backdrop-blur border border-ivory/15 text-ivory/80 rounded-full px-2 py-0.5 label-caps text-[9px]">
                {theme.name}
              </span>

              {/* Status badge */}
              {site.status === "active" ? (
                <span className="flex items-center gap-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded-full px-2 py-0.5 label-caps text-[9px]">
                  <Globe size={8} /> Published
                </span>
              ) : (
                <span className="flex items-center gap-1 bg-ivory/10 border border-ivory/20 text-ivory/50 rounded-full px-2 py-0.5 label-caps text-[9px]">
                  <Lock size={8} /> Draft
                </span>
              )}
            </div>

            <div>
              <p className="font-display text-xl text-ivory leading-tight truncate">{site.title}</p>
              <p className="text-ivory/50 text-xs mt-0.5">Updated {formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          {/* Stats bar */}
          <div className="flex items-center justify-between mb-4 text-xs text-ivory/60">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <Eye size={13} className="text-gold" />
                {(site.views ?? 0).toLocaleString()} views
              </span>
              <SeoScoreBadge score={98} />
            </div>
            <button
              onClick={() => onAnalytics?.(site)}
              className="flex items-center gap-1 text-gold hover:underline text-[11px] font-medium"
            >
              <BarChart3 size={12} /> Analytics
            </button>
          </div>

          {/* URL preview line */}
          <div className="flex items-center gap-2 bg-ivory/5 border border-ivory/10 rounded-xl px-3 py-2 mb-4">
            <span className="flex-1 text-ivory/40 font-mono text-[11px] truncate">
              /sites/{site.slug || site.id}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="px-5 pb-5 pt-0 flex items-center gap-2">
        <button
          onClick={() => onEdit?.(site)}
          className="flex-1 flex items-center justify-center gap-1.5 border border-gold/30 hover:border-gold bg-gold/5 hover:bg-gold/15 rounded-xl py-2 text-gold label-caps text-[10px] transition-all"
        >
          <Edit3 size={12} /> Edit
        </button>

        <button
          onClick={() => onPreview?.(site)}
          className="flex-1 flex items-center justify-center gap-1.5 border border-ivory/15 hover:border-ivory/40 bg-ivory/5 hover:bg-ivory/10 rounded-xl py-2 text-ivory/70 hover:text-ivory label-caps text-[10px] transition-all"
        >
          <Play size={12} /> Preview
        </button>

        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 border border-ivory/15 hover:border-ivory/40 bg-ivory/5 hover:bg-ivory/10 rounded-xl text-ivory/70 hover:text-ivory transition-all"
          title="Open Live Website"
        >
          <ExternalLink size={14} />
        </a>

        {/* More Options Dropdown */}
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
              <div className="absolute right-0 bottom-full mb-1 z-20 glass-panel rounded-xl py-1.5 min-w-[160px] shadow-2xl border border-ivory/20">
                <button
                  onClick={() => {
                    onPublish?.(site);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-ivory/80 hover:text-ivory hover:bg-ivory/10 text-xs w-full text-left"
                >
                  <UploadCloud size={13} className="text-gold" /> Publish / Republish
                </button>
                <button
                  onClick={() => {
                    onRename?.(site);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-ivory/80 hover:text-ivory hover:bg-ivory/10 text-xs w-full text-left"
                >
                  <Edit3 size={13} /> Rename Title
                </button>
                <button
                  onClick={() => {
                    onDuplicate?.(site.id);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-ivory/80 hover:text-ivory hover:bg-ivory/10 text-xs w-full text-left"
                >
                  <CopyPlus size={13} /> Duplicate Site
                </button>
                <button
                  onClick={() => {
                    onAnalytics?.(site);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-ivory/80 hover:text-ivory hover:bg-ivory/10 text-xs w-full text-left"
                >
                  <BarChart3 size={13} /> View Analytics
                </button>
                <button
                  onClick={() => {
                    onHistory?.(site);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-ivory/80 hover:text-ivory hover:bg-ivory/10 text-xs w-full text-left"
                >
                  <History size={13} /> Publish History
                </button>
                <button
                  onClick={() => {
                    onExport?.(site);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-ivory/80 hover:text-ivory hover:bg-ivory/10 text-xs w-full text-left"
                >
                  <Download size={13} /> Export Package
                </button>
                <button
                  onClick={() => {
                    copyLink();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-ivory/80 hover:text-ivory hover:bg-ivory/10 text-xs w-full text-left"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />} Copy Live Link
                </button>
                <div className="h-px bg-ivory/10 my-1" />
                <button
                  onClick={() => {
                    handleDelete();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-destructive hover:bg-destructive/10 text-xs w-full text-left font-medium"
                >
                  <Trash2 size={13} /> Delete Site
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
