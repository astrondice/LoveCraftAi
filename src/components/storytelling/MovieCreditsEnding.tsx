// ─────────────────────────────────────────────────────────────────
// MovieCreditsEnding — Netflix/A24-Style Movie Credits Finale
// ─────────────────────────────────────────────────────────────────
import { motion } from "framer-motion";
import { Film, Heart, Sparkles } from "lucide-react";
import { useThemeTokens } from "@/themes";

interface MovieCreditsEndingProps {
  title: string;
  subtitle?: string;
  creditsList?: Array<{ role: string; name: string }>;
  footerText?: string;
  className?: string;
}

export function MovieCreditsEnding({
  title,
  subtitle = "A LoveCraft AI Cinematic Presentation",
  creditsList = [
    { role: "DIRECTED & CURATED BY", name: "Family & Heart" },
    { role: "FEATURED MEMORIES", name: "Childhood & Beyond" },
    { role: "MUSIC SOUNDTRACK", name: "Acoustic Reflection" },
  ],
  footerText = "Bound by love. Cherished for a lifetime.",
  className = "",
}: MovieCreditsEndingProps) {
  const theme = useThemeTokens();
  const c = theme.colors;

  return (
    <footer className={`relative z-10 py-32 px-6 text-center border-t border-[var(--theme-border)] bg-[var(--theme-bg)] ${className}`}>
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Film Reel Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="w-16 h-16 rounded-full border border-[var(--theme-border)] bg-[var(--theme-glass-bg)] grid place-items-center mx-auto shadow-xl"
        >
          <Film size={28} style={{ color: c.goldAccent }} />
        </motion.div>

        {/* Title & Subtitle */}
        <div>
          <h2
            className="font-display text-4xl md:text-6xl text-[var(--theme-text-primary)]"
            style={{ fontFamily: theme.typography.fontHeading }}
          >
            {title}
          </h2>
          <p className="label-caps text-xs tracking-widest text-[var(--theme-text-muted)] mt-3">
            {subtitle}
          </p>
        </div>

        {/* Credits Roll Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-b border-[var(--theme-border)] py-8">
          {creditsList.map((credit, i) => (
            <div key={i} className="space-y-1">
              <span className="label-caps text-[9px] text-[var(--theme-text-muted)] tracking-widest block">
                {credit.role}
              </span>
              <p className="text-sm font-semibold text-[var(--theme-text-primary)]">
                {credit.name}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Tagline */}
        <div className="flex items-center justify-center gap-2 text-sm text-[var(--theme-text-muted)] font-light italic">
          <Sparkles size={14} style={{ color: c.goldAccent }} />
          <span>{footerText}</span>
          <Heart size={14} className="text-rose-500 fill-current ml-1" />
        </div>
      </div>
    </footer>
  );
}
