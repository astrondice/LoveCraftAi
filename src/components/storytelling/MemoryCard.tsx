// ─────────────────────────────────────────────────────────────────
// MemoryCard — Tactile Paper Card with Polaroid Tilt & Handwritten Notes
// ─────────────────────────────────────────────────────────────────
import { motion } from "framer-motion";
import { Paperclip, Heart } from "lucide-react";
import { useThemeTokens } from "@/themes";

interface MemoryCardProps {
  title: string;
  note?: string;
  imageUrl?: string;
  date?: string;
  location?: string;
  rotationDegree?: number; // e.g. -2 or 3 degrees for realistic scrapbooking
  className?: string;
}

export function MemoryCard({
  title,
  note,
  imageUrl,
  date,
  location,
  rotationDegree = 0,
  className = "",
}: MemoryCardProps) {
  const theme = useThemeTokens();
  const c = theme.colors;

  return (
    <motion.div
      whileHover={{ y: -8, rotate: 0, scale: 1.02 }}
      initial={{ rotate: rotationDegree }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`relative p-5 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-paper-bg)] shadow-xl ${className}`}
      style={{
        boxShadow: theme.shadows.card,
      }}
    >
      {/* Decorative Physical Paperclip Anchor */}
      <div className="absolute -top-3 left-6 z-20 text-[var(--theme-text-muted)] opacity-70">
        <Paperclip size={24} style={{ color: c.goldAccent }} />
      </div>

      {/* Polaroid Image Box */}
      {imageUrl && (
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-charcoal/20">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Card Content Body */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h4
            className="font-display text-lg text-[var(--theme-text-primary)]"
            style={{ fontFamily: theme.typography.fontHeading }}
          >
            {title}
          </h4>
          <Heart size={14} className="text-rose-500/80 fill-current opacity-80" />
        </div>

        {date && (
          <span className="label-caps text-[10px] text-[var(--theme-text-muted)] block mb-2">
            {date} {location ? `• ${location}` : ""}
          </span>
        )}

        {note && (
          <p
            className="text-sm text-[var(--theme-text-muted)] italic leading-relaxed pt-2 border-t border-[var(--theme-border)]"
            style={{ fontFamily: theme.typography.fontAccent || theme.typography.fontBody }}
          >
            "{note}"
          </p>
        )}
      </div>
    </motion.div>
  );
}
