// ─────────────────────────────────────────────────────────────────
// LongDistanceMap — Animated Connection Thread & Audio Player
// ─────────────────────────────────────────────────────────────────
import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Music, Volume2, VolumeX, Compass } from "lucide-react";
import { useThemeTokens } from "@/themes";

interface LongDistanceMapProps {
  location1?: string; // e.g. "Mumbai, India"
  location2?: string; // e.g. "London, UK"
  distanceText?: string; // e.g. "7,185 km apart • 1 heart"
  audioUrl?: string;
  audioTitle?: string;
  className?: string;
}

export function LongDistanceMap({
  location1 = "Home Town",
  location2 = "Across the Ocean",
  distanceText = "Miles apart, hearts forever connected",
  audioUrl,
  audioTitle = "Voice Note from Home",
  className = "",
}: LongDistanceMapProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const theme = useThemeTokens();
  const c = theme.colors;

  return (
    <div
      className={`relative max-w-4xl mx-auto p-8 md:p-12 rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-surface)] shadow-2xl overflow-hidden ${className}`}
    >
      {/* Dynamic Animated Route Map Graphic */}
      <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-[var(--theme-border)] bg-black/40 flex items-center justify-between px-8 md:px-16 mb-8">
        {/* Ambient Map Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />

        {/* Location 1 Point */}
        <div className="relative z-10 text-center">
          <div className="w-10 h-10 rounded-full bg-sky-500/20 border-2 border-sky-400 grid place-items-center mx-auto mb-2 shadow-lg shadow-sky-500/30">
            <Compass size={18} className="text-sky-300 animate-spin-slow" />
          </div>
          <span className="label-caps text-xs text-[var(--theme-text-primary)] font-bold block">
            {location1}
          </span>
        </div>

        {/* Glowing Thread Connection SVG */}
        <div className="flex-1 relative mx-4 h-12 flex items-center justify-center">
          <svg className="w-full h-8" overflow="visible">
            <path
              d="M 0 16 Q 50% -10, 100% 16"
              fill="none"
              stroke={c.goldAccent}
              strokeWidth="2"
              strokeDasharray="6 6"
              className="animate-pulse"
            />
          </svg>
          <motion.div
            animate={{ x: ["0%", "100%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gold shadow-lg shadow-gold"
          />
        </div>

        {/* Location 2 Point */}
        <div className="relative z-10 text-center">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-400 grid place-items-center mx-auto mb-2 shadow-lg shadow-amber-500/30">
            <Globe size={18} className="text-amber-300" />
          </div>
          <span className="label-caps text-xs text-[var(--theme-text-primary)] font-bold block">
            {location2}
          </span>
        </div>
      </div>

      {/* Distance Badge & Message */}
      <div className="text-center mb-8">
        <span className="px-4 py-1 rounded-full border border-[var(--theme-border)] bg-[var(--theme-glass-bg)] label-caps text-xs font-bold text-[var(--theme-gold)]">
          {distanceText}
        </span>
      </div>

      {/* Optional Voice Note / Audio Soundtrack Player */}
      {audioUrl && (
        <div className="max-w-md mx-auto p-4 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-glass-bg)] backdrop-blur flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/20 grid place-items-center text-[var(--theme-gold)]">
              <Music size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--theme-text-primary)]">{audioTitle}</p>
              <p className="label-caps text-[10px] text-[var(--theme-text-muted)]">Click to listen</p>
            </div>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-[var(--theme-gold)] text-charcoal grid place-items-center font-bold shadow-md hover:scale-105 transition-all"
          >
            {isPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      )}
    </div>
  );
}
