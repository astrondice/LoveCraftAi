// ─────────────────────────────────────────────────────────────────
// PublishSuccess — "✓ Published Successfully" screen
// Shown after a successful publish inside PublishModal.
// The URL is the REAL canonical URL returned by publish.service.ts.
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
  Globe,
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

  const liveUrl = result.url; // canonical public URL from publish service

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(liveUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const openLiveSite = () => {
    window.open(liveUrl, "_blank", "noopener,noreferrer");
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: result.site.title,
          text: "I made something for you ❤️ — A cinematic love website, just for us.",
          url: liveUrl,
        });
      } catch {
        // User dismissed share sheet — not an error
      }
    } else {
      // WhatsApp fallback
      const msg = encodeURIComponent(
        `I made something for you ❤️\n\n${liveUrl}\n\nOpen it — it's our story, as a cinematic experience.\n\nMade with LoveCraft AI`,
      );
      window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="text-center"
    >
      {/* ✓ Published Successfully header */}
      <div className="mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        >
          <div className="relative w-16 h-16 mx-auto mb-4">
            <span className="absolute inset-0 rounded-full border-2 border-gold/30 animate-ping" />
            <span
              className="absolute inset-2 rounded-full border-2 border-gold/50 animate-ping"
              style={{ animationDelay: "0.3s" }}
            />
            <span className="absolute inset-3 rounded-full bg-gold/10 grid place-items-center">
              <Sparkles className="text-gold" size={20} />
            </span>
          </div>
        </motion.div>

        <p className="label-caps text-gold text-[11px] mb-2">✓ Published Successfully</p>
        <h2 className="font-display text-3xl md:text-4xl text-ivory">
          Your Love Story is <span className="italic gold-shimmer">Live!</span>
        </h2>
        <p className="mt-3 text-ivory/60 text-sm">
          Share this link anywhere — it works on every device, forever.
        </p>
      </div>

      {/* Live URL display */}
      <div className="glass-panel rounded-2xl px-5 py-4 mb-5 text-left">
        <div className="flex items-center gap-2 mb-1">
          <Globe size={10} className="text-gold" />
          <p className="label-caps text-ivory/40 text-[10px]">Live Website URL</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex-1 text-ivory font-mono text-sm truncate">{liveUrl}</span>
          <button
            onClick={copyLink}
            className="shrink-0 w-9 h-9 rounded-xl bg-ivory/10 hover:bg-ivory/20 grid place-items-center transition-colors"
            aria-label="Copy live URL"
            title="Copy link"
          >
            {copied ? (
              <Check size={16} className="text-gold" />
            ) : (
              <Copy size={16} className="text-ivory/70" />
            )}
          </button>
        </div>
      </div>

      {/* Primary action buttons */}
      <div className="flex flex-col gap-3 mb-5">
        {/* Open Live Website — PRIMARY CTA */}
        <button
          id="open-live-website-btn"
          onClick={openLiveSite}
          className="flex items-center justify-center gap-2 w-full bg-gold hover:bg-gold/90 text-charcoal font-semibold rounded-2xl py-3.5 label-caps text-[12px] transition-all shadow-lg shadow-gold/20"
        >
          <ExternalLink size={15} />
          Open Live Website
        </button>

        {/* Secondary actions */}
        <div className="grid grid-cols-3 gap-2">
          <button
            id="copy-link-btn"
            onClick={copyLink}
            className="flex items-center justify-center gap-1.5 border border-gold/40 hover:border-gold bg-gold/10 hover:bg-gold/20 rounded-2xl py-3 text-gold label-caps text-[11px] transition-all"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <button
            onClick={share}
            className="flex items-center justify-center gap-1.5 border border-ivory/20 hover:border-ivory/50 bg-ivory/5 hover:bg-ivory/10 rounded-2xl py-3 text-ivory label-caps text-[11px] transition-all"
          >
            <Share2 size={13} />
            Share
          </button>
          <a
            href="/dashboard"
            className="flex items-center justify-center gap-1.5 border border-ivory/20 hover:border-ivory/50 bg-ivory/5 hover:bg-ivory/10 rounded-2xl py-3 text-ivory label-caps text-[11px] transition-all"
          >
            <LayoutDashboard size={13} />
            Dashboard
          </a>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center mb-6">
        <p className="label-caps text-ivory/40 text-[10px] mb-3">QR Code</p>
        <QRCodeDisplay url={liveUrl} size={140} />
        <p className="text-ivory/30 text-xs mt-2">Scan to open on any phone</p>
      </div>

      {/* Bottom actions */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={onCreateAnother}
          className="flex items-center gap-2 text-ivory/50 hover:text-ivory label-caps text-[10px] transition-colors"
        >
          <RefreshCw size={12} />
          Create Another
        </button>
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-ivory/50 hover:text-ivory label-caps text-[10px] transition-colors"
        >
          Close
        </button>
      </div>
    </motion.div>
  );
}
