// ─────────────────────────────────────────────────────────────────
// Birthday Category — Theme Configuration Tokens
// ─────────────────────────────────────────────────────────────────
import type { ThemeTokens } from "../types";

export const defaultBirthdayTheme: ThemeTokens = {
  id: "bday-memories",
  name: "Birthday Memories",
  category: "birthday",
  vibe: "Electric Purple & Neon Gold",
  atmosphere: "Pure joy, laughter, and birthday sparkles.",
  colors: {
    background: "#0c051a",
    surface: "#180a33",
    surfaceContainer: "#24104c",
    surfaceContainerHigh: "#311666",
    textPrimary: "#ffffff",
    textMuted: "#c4b5fd",
    accentPrimary: "#a855f7",
    accentSecondary: "#ec4899",
    goldAccent: "#eab308",
    border: "rgba(168, 85, 247, 0.3)",
    borderHover: "rgba(234, 179, 8, 0.6)",
    glassBg: "rgba(24, 10, 51, 0.7)",
    glassBorder: "rgba(168, 85, 247, 0.3)",
    paperBg: "#180a33",
    shadowColor: "rgba(12, 5, 26, 0.8)",
    glowColor: "rgba(168, 85, 247, 0.35)",
  },
  typography: {
    fontHeading: "'Playfair Display', serif",
    fontBody: "'Inter', sans-serif",
    displayLg: { fontSize: "clamp(48px, 6vw, 80px)", lineHeight: "1.1", letterSpacing: "0em", fontWeight: "700" },
    headlineMd: { fontSize: "clamp(28px, 4vw, 40px)", lineHeight: "1.2", letterSpacing: "0em", fontWeight: "600" },
    bodyLg: { fontSize: "18px", lineHeight: "1.6", fontWeight: "400" },
    labelCaps: { fontSize: "12px", letterSpacing: "0.15em", fontWeight: "600" },
  },
  spacing: {
    unit: 8,
    marginDesktop: "80px",
    marginMobile: "24px",
    sectionGap: "140px",
    cardPadding: "32px",
  },
  radius: {
    sm: "6px",
    md: "14px",
    lg: "24px",
    xl: "36px",
    full: "9999px",
  },
  shadows: {
    subtle: "0 4px 20px rgba(0, 0, 0, 0.3)",
    card: "0 12px 36px rgba(12, 5, 26, 0.6)",
    hover: "0 24px 48px rgba(168, 85, 247, 0.3)",
    glow: "0 0 35px rgba(234, 179, 8, 0.4)",
  },
  motion: {
    motionFast: "cubic-bezier(0.4, 0, 0.2, 1) 150ms",
    motionNormal: "cubic-bezier(0.4, 0, 0.2, 1) 350ms",
    motionSlow: "cubic-bezier(0.4, 0, 0.2, 1) 600ms",
    motionChapter: "cubic-bezier(0.16, 1, 0.3, 1) 1000ms",
    motionThread: "ease-in-out 1200ms",
    motionPaper: "cubic-bezier(0.25, 1, 0.5, 1) 800ms",
  },
  particles: {
    type: "confetti",
    particleColor: "rgba(234, 179, 8, 0.4)",
    countHigh: 100,
    countMedium: 45,
    speed: 0.2,
    maxRadius: 3,
  },
};
