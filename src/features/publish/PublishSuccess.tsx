// ─────────────────────────────────────────────────────────────────
// PublishSuccess — The "🎉 Your site is live!" screen
// Shown after successful publishing inside PublishModal
// ─────────────────────────────────────────────────────────────────
import { motion } from "framer-motion";
import {
  Copy,
  ExternalLink,
  Share2,
  LayoutDashboard,
  Check,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { QRCodeDisplay } from "./QRCodeDisplay";
import type { PublishResult } from "@/types";

interface PublishSuccessProps {
  result: PublishResult;
  onClose: () => void;
  onCreateAnother: () => void;
}

export function PublishSuccess({ result, onClose, onCreateAnother }: PublishSuccessProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: result.site.title,
          text: "I made something for you ❤️ — A cinematic love website, just for us.",
          url: result.url,
        });
      } catch {
        // User dismissed share sheet
      }
    } else {
      // Fallback: WhatsApp
      const msg = encodeURIComponent(
        `I made something for you ❤️\n\n${result.url}\n\nOpen it — it's our story, as a cinematic experience.\n\nMade with LoveCraft AI`,
      );
      window.open(`https://wa.me/?text=${msg}`, "_blank");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="text-center"
    >
      {/* Celebration header */}
      <div className="mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        >
          <Sparkles className="text-gold mx-auto mb-4" size={44} />
        </motion.div>
        <h2 className="font-display text-3xl md:text-4xl text-ivory">
          Your Love Story is{" "}
          <span className="italic gold-shimmer">Live!</span>
        </h2>
        <p className="mt-3 text-ivory/60 text-sm">
          Share this link anywhere — it works on every device, forever.
        </p>
      </div>

      {/* URL display */}
      <div className="glass-panel rounded-2xl px-5 py-4 mb-5 text-left">
        <p className="label-caps text-ivory/40 text-[10px] mb-1">Live URL</p>
        <div className="flex items-center gap-3">
          <span className="flex-1 text-ivory font-mono text-sm truncate">
            {result.url}
          </span>
          <button
            onClick={copyLink}
            className="shrink-0 w-9 h-9 rounded-xl bg-ivory/10 hover:bg-ivory/20 grid place-items-center transition-colors"
            aria-label="Copy link"
          >
            {copied ? (
              <Check size={16} className="text-gold" />
            ) : (
              <Copy size={16} className="text-ivory/70" />
            )}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={copyLink}
          className="flex items-center justify-center gap-2 border border-gold/40 hover:border-gold bg-gold/10 hover:bg-gold/20 rounded-2xl py-3 text-gold label-caps text-[11px] transition-all"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 border border-ivory/20 hover:border-ivory/50 bg-ivory/5 hover:bg-ivory/10 rounded-2xl py-3 text-ivory label-caps text-[11px] transition-all"
        >
          <ExternalLink size={14} />
          Open Site
        </a>
        <button
          onClick={share}
          className="flex items-center justify-center gap-2 border border-ivory/20 hover:border-ivory/50 bg-ivory/5 hover:bg-ivory/10 rounded-2xl py-3 text-ivory label-caps text-[11px] transition-all"
        >
          <Share2 size={14} />
          Share
        </button>
        <a
          href="/dashboard"
          className="flex items-center justify-center gap-2 border border-ivory/20 hover:border-ivory/50 bg-ivory/5 hover:bg-ivory/10 rounded-2xl py-3 text-ivory label-caps text-[11px] transition-all"
        >
          <LayoutDashboard size={14} />
          Dashboard
        </a>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center mb-6">
        <p className="label-caps text-ivory/40 text-[10px] mb-3">QR Code</p>
        <QRCodeDisplay url={result.url} size={140} />
        <p className="text-ivory/30 text-xs mt-2">
          Scan to open on any phone
        </p>
      </div>

      {/* Bottom actions */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={onCreateAnother}
          className="flex items-center gap-2 text-ivory/50 hover:text-ivory label-caps text-[10px] transition-colors"
        >
          <RefreshCw size={12} />
          Create Another
        </button>
      </div>
    </motion.div>
  );
}
