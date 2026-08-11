// ─────────────────────────────────────────────────────────────────
// EditorialLetter — Unfolding Paper Presentation & Ink Reveal Letter
// ─────────────────────────────────────────────────────────────────
import { motion } from "framer-motion";
import { Feather, Heart } from "lucide-react";
import { useThemeTokens } from "@/themes";

interface EditorialLetterProps {
  salutation?: string; // e.g. "Dear Brother,"
  message: string;
  senderName?: string; // e.g. "Forever, your Sister"
  date?: string;
  className?: string;
}

export function EditorialLetter({
  salutation = "Dearest Sibling,",
  message,
  senderName = "With all my love",
  date,
  className = "",
}: EditorialLetterProps) {
  const theme = useThemeTokens();
  const c = theme.colors;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className={`relative max-w-3xl mx-auto p-8 md:p-14 rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-paper-bg)] shadow-2xl overflow-hidden ${className}`}
    >
      {/* Background Subtle Watermark Icon */}
      <div className="absolute right-6 top-6 opacity-5 pointer-events-none text-[var(--theme-text-primary)]">
        <Feather size={120} />
      </div>

      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[var(--theme-border)] pb-4 mb-8">
        <div className="flex items-center gap-2">
          <Feather size={16} style={{ color: c.goldAccent }} />
          <span className="label-caps text-xs text-[var(--theme-text-muted)] tracking-widest uppercase">
            A Letter From The Heart
          </span>
        </div>
        {date && (
          <span className="label-caps text-xs text-[var(--theme-text-muted)] font-mono">
            {date}
          </span>
        )}
      </div>

      {/* Letter Body */}
      <div className="space-y-6">
        <h3
          className="font-display text-2xl md:text-3xl text-[var(--theme-text-primary)]"
          style={{ fontFamily: theme.typography.fontHeading }}
        >
          {salutation}
        </h3>

        <div
          className="text-base md:text-xl text-[var(--theme-text-primary)] font-light leading-relaxed whitespace-pre-line"
          style={{ fontFamily: theme.typography.fontAccent || theme.typography.fontBody }}
        >
          {message}
        </div>
      </div>

      {/* Signature & Wax Seal Footer */}
      <div className="mt-12 pt-8 border-t border-[var(--theme-border)] flex items-center justify-between">
        <div>
          <span className="label-caps text-[10px] text-[var(--theme-text-muted)] block mb-1">
            Sealed with devotion
          </span>
          <p
            className="font-display text-xl md:text-2xl text-[var(--theme-gold)] italic"
            style={{ fontFamily: theme.typography.fontHeading }}
          >
            {senderName}
          </p>
        </div>

        {/* Debossed Wax Seal Badge */}
        <div
          className="w-14 h-14 rounded-full border-2 border-[var(--theme-border)] grid place-items-center shadow-lg"
          style={{
            backgroundColor: c.accentPrimary,
            boxShadow: theme.shadows.glow,
          }}
        >
          <Heart size={20} className="text-white fill-current animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}
