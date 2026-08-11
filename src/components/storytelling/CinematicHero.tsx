// ─────────────────────────────────────────────────────────────────
// CinematicHero — Full Viewport Hero Layout & Typographic Reveal
// Consumes Theme Tokens via useThemeTokens()
// ─────────────────────────────────────────────────────────────────
import { motion } from "framer-motion";
import { ChevronDown, Play, Sparkles } from "lucide-react";
import { useThemeTokens } from "@/themes";
import { AdaptiveParticleCanvas } from "./AdaptiveParticleCanvas";

interface CinematicHeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
  heroImage?: string;
  primaryCtaText?: string;
  onPrimaryCtaClick?: () => void;
  secondaryCtaText?: string;
  onSecondaryCtaClick?: () => void;
}

export function CinematicHero({
  title,
  subtitle,
  badge = "✦ Cinematic Experience",
  heroImage,
  primaryCtaText = "Begin Experience",
  onPrimaryCtaClick,
  secondaryCtaText,
  onSecondaryCtaClick,
}: CinematicHeroProps) {
  const theme = useThemeTokens();
  const c = theme.colors;

  return (
    <section className="relative z-10 min-h-screen flex items-center justify-center px-6 md:px-16 pt-24 pb-16 overflow-hidden">
      {/* Background FX Particle Canvas */}
      <AdaptiveParticleCanvas />

      {/* Layered Background Image Ambient Glow (if provided) */}
      {heroImage && (
        <div className="absolute inset-0 z-0 overflow-hidden opacity-25 pointer-events-none">
          <img
            src={heroImage}
            alt=""
            className="w-full h-full object-cover scale-105 filter blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-bg)] via-[var(--theme-bg)]/60 to-transparent" />
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        {badge && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--theme-border)] bg-[var(--theme-glass-bg)] backdrop-blur-md mb-8"
          >
            <Sparkles size={12} style={{ color: c.goldAccent }} />
            <span className="label-caps text-[11px] tracking-widest text-[var(--theme-text-muted)] font-semibold">
              {badge}
            </span>
          </motion.div>
        )}

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight text-[var(--theme-text-primary)]"
          style={{ fontFamily: theme.typography.fontHeading }}
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-[var(--theme-text-muted)] font-light leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {primaryCtaText && (
            <button
              onClick={onPrimaryCtaClick}
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm label-caps tracking-wider transition-all shadow-xl hover:scale-105 focus-visible:outline-none"
              style={{
                backgroundColor: c.accentPrimary,
                color: "#ffffff",
                boxShadow: theme.shadows.hover,
              }}
            >
              {primaryCtaText}
            </button>
          )}

          {secondaryCtaText && (
            <button
              onClick={onSecondaryCtaClick}
              className="w-full sm:w-auto px-6 py-4 rounded-full border border-[var(--theme-border)] bg-[var(--theme-glass-bg)] hover:bg-white/10 text-[var(--theme-text-primary)] font-semibold text-xs label-caps tracking-wider transition-all flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <Play size={14} style={{ color: c.goldAccent }} />
              {secondaryCtaText}
            </button>
          )}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--theme-text-muted)]"
      >
        <span className="label-caps text-[10px] tracking-widest uppercase">Scroll</span>
        <ChevronDown size={16} className="animate-bounce" style={{ color: c.goldAccent }} />
      </motion.div>
    </section>
  );
}
