// ─────────────────────────────────────────────────────────────────
// Raksha Bandhan Category — 6 Unique Theme Variants
// Derived from Purest Bond & Heritage Tactile Design Systems
// ─────────────────────────────────────────────────────────────────
import type { ThemeTokens } from "../types";

export const rakhiBondTheme: ThemeTokens = {
  id: "rakhi-bond",
  name: "Purest Brother–Sister Bond",
  category: "raksha-bandhan",
  vibe: "Golden Saffron & Sacred Silk",
  atmosphere: "A quiet, expansive, documentary-style celebration of unconditional sibling devotion.",
  colors: {
    background: "#fcf9f5",
    surface: "#f6f3ef",
    surfaceContainer: "#f0ede9",
    surfaceContainerHigh: "#eae8e4",
    textPrimary: "#1c1c1a",
    textMuted: "#554243",
    accentPrimary: "#5d101d", // Deep Maroon
    accentSecondary: "#e9967a", // Soft Saffron
    goldAccent: "#d4af37", // Champagne Gold
    border: "rgba(212, 175, 55, 0.25)",
    borderHover: "rgba(93, 16, 29, 0.4)",
    glassBg: "rgba(252, 249, 245, 0.75)",
    glassBorder: "rgba(212, 175, 55, 0.3)",
    paperBg: "#ffffff",
    shadowColor: "rgba(93, 16, 29, 0.06)",
    glowColor: "rgba(212, 175, 55, 0.25)",
  },
  typography: {
    fontHeading: "'Playfair Display', serif",
    fontBody: "'Inter', sans-serif",
    fontAccent: "'Playfair Display', serif",
    displayLg: { fontSize: "clamp(44px, 7vw, 80px)", lineHeight: "1.12", letterSpacing: "0.03em", fontWeight: "700" },
    headlineMd: { fontSize: "clamp(26px, 4vw, 42px)", lineHeight: "1.2", letterSpacing: "0.02em", fontWeight: "600" },
    bodyLg: { fontSize: "18px", lineHeight: "1.75", fontWeight: "400" },
    labelCaps: { fontSize: "12px", letterSpacing: "0.15em", fontWeight: "600" },
  },
  spacing: {
    unit: 8,
    marginDesktop: "80px",
    marginMobile: "24px",
    sectionGap: "160px",
    cardPadding: "36px",
  },
  radius: {
    sm: "4px",
    md: "12px",
    lg: "20px",
    xl: "32px",
    full: "9999px",
  },
  shadows: {
    subtle: "0 4px 20px rgba(93, 16, 29, 0.04)",
    card: "0 12px 36px rgba(93, 16, 29, 0.08)",
    hover: "0 24px 48px rgba(212, 175, 55, 0.2)",
    glow: "0 0 35px rgba(212, 175, 55, 0.3)",
  },
  motion: {
    motionFast: "cubic-bezier(0.4, 0, 0.2, 1) 150ms",
    motionNormal: "cubic-bezier(0.4, 0, 0.2, 1) 350ms",
    motionSlow: "cubic-bezier(0.4, 0, 0.2, 1) 650ms",
    motionChapter: "cubic-bezier(0.16, 1, 0.3, 1) 1000ms",
    motionThread: "cubic-bezier(0.25, 1, 0.5, 1) 1200ms",
    motionPaper: "cubic-bezier(0.25, 1, 0.5, 1) 800ms",
  },
  particles: {
    type: "saffron-dust",
    particleColor: "rgba(212, 175, 55, 0.35)",
    countHigh: 90,
    countMedium: 40,
    speed: 0.12,
    maxRadius: 2.5,
  },
  paper: {
    deckledEdges: true,
    polaroidTilt: true,
    inkEffect: true,
  },
};

export const rakhiThreadsTheme: ThemeTokens = {
  ...rakhiBondTheme,
  id: "rakhi-threads",
  name: "Threads of Love",
  vibe: "Marigold Yellow & Crimson Silk",
  atmosphere: "Handcrafted scrapbook aesthetic with deckled paper edges and polaroid memories.",
  colors: {
    ...rakhiBondTheme.colors,
    background: "#fbfaee",
    surface: "#f5f4e8",
    surfaceContainer: "#efeee3",
    textPrimary: "#1b1c15",
    textMuted: "#4e453d",
    accentPrimary: "#33210d",
    goldAccent: "#775a19",
    paperBg: "#ffffff",
  },
  particles: {
    type: "golden-thread",
    particleColor: "rgba(233, 195, 73, 0.4)",
    countHigh: 80,
    countMedium: 35,
    speed: 0.15,
    maxRadius: 2,
  },
};

export const rakhiChildhoodTheme: ThemeTokens = {
  ...rakhiBondTheme,
  id: "rakhi-childhood",
  name: "Our Childhood",
  vibe: "Nostalgic Polaroid & Warm Sepia",
  atmosphere: "An interactive nostalgic adventure through shared secrets and childhood fights.",
  colors: {
    ...rakhiBondTheme.colors,
    background: "#f6f3ef",
    accentPrimary: "#745c00",
    accentSecondary: "#d18267",
  },
};

export const rakhiMilesTheme: ThemeTokens = {
  ...rakhiBondTheme,
  id: "rakhi-miles",
  name: "Miles Apart Hearts Together",
  vibe: "Celestial Map & Midnight Gold",
  atmosphere: "Glowing constellations and long-distance connection threads.",
  colors: {
    ...rakhiBondTheme.colors,
    background: "#020914",
    surface: "#0f172a",
    surfaceContainer: "#1e293b",
    textPrimary: "#f8fafc",
    textMuted: "#94a3b8",
    accentPrimary: "#38bdf8",
    goldAccent: "#f59e0b",
    border: "rgba(56, 189, 248, 0.2)",
    glassBg: "rgba(15, 23, 42, 0.7)",
  },
  particles: {
    type: "constellations",
    particleColor: "rgba(56, 189, 248, 0.35)",
    countHigh: 110,
    countMedium: 50,
    speed: 0.1,
    maxRadius: 2,
  },
};

export const RAKSHA_BANDHAN_THEMES: Record<string, ThemeTokens> = {
  "rakhi-bond": rakhiBondTheme,
  "rakhi-threads": rakhiThreadsTheme,
  "rakhi-childhood": rakhiChildhoodTheme,
  "rakhi-brother": rakhiBondTheme,
  "rakhi-sister": rakhiBondTheme,
  "rakhi-miles": rakhiMilesTheme,
  "rakhi-promise": rakhiBondTheme,
  "rakhi-memories": rakhiBondTheme,
};
