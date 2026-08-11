// ─────────────────────────────────────────────────────────────────
// Enterprise Theme System — Token Types & Theme Interface
// ─────────────────────────────────────────────────────────────────

export interface ColorTokens {
  background: string;
  surface: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  textPrimary: string;
  textMuted: string;
  accentPrimary: string;
  accentSecondary: string;
  goldAccent: string;
  border: string;
  borderHover: string;
  glassBg: string;
  glassBorder: string;
  paperBg: string;
  paperTexture?: string;
  shadowColor: string;
  glowColor: string;
}

export interface TypographyTokens {
  fontHeading: string;
  fontBody: string;
  fontAccent?: string;
  fontLabel?: string;
  displayLg: { fontSize: string; lineHeight: string; letterSpacing: string; fontWeight: string };
  headlineMd: { fontSize: string; lineHeight: string; letterSpacing: string; fontWeight: string };
  bodyLg: { fontSize: string; lineHeight: string; fontWeight: string };
  labelCaps: { fontSize: string; letterSpacing: string; fontWeight: string };
}

export interface SpacingTokens {
  unit: number; // base unit in px (e.g. 8)
  marginDesktop: string; // e.g. "80px"
  marginMobile: string; // e.g. "24px"
  sectionGap: string; // e.g. "140px"
  cardPadding: string; // e.g. "32px"
}

export interface RadiusTokens {
  sm: string; // e.g. "4px"
  md: string; // e.g. "12px"
  lg: string; // e.g. "20px"
  xl: string; // e.g. "32px"
  full: string; // e.g. "9999px"
}

export interface ShadowTokens {
  subtle: string;
  card: string;
  hover: string;
  glow: string;
}

export interface MotionTokens {
  motionFast: string; // e.g. "cubic-bezier(0.4, 0, 0.2, 1) 150ms"
  motionNormal: string; // e.g. "cubic-bezier(0.4, 0, 0.2, 1) 350ms"
  motionSlow: string; // e.g. "cubic-bezier(0.4, 0, 0.2, 1) 600ms"
  motionChapter: string; // e.g. "cubic-bezier(0.16, 1, 0.3, 1) 1000ms"
  motionThread: string; // e.g. "golden thread weave ease-in-out 1200ms"
  motionPaper: string; // e.g. "cubic-bezier(0.25, 1, 0.5, 1) 800ms"
}

export interface ParticleTokens {
  type: "starlight" | "golden-thread" | "sakura-petals" | "saffron-dust" | "confetti" | "constellations";
  particleColor: string;
  countHigh: number;
  countMedium: number;
  speed: number;
  maxRadius: number;
}

export interface PaperTokens {
  textureUrl?: string;
  deckledEdges?: boolean;
  polaroidTilt?: boolean;
  inkEffect?: boolean;
}

export interface ThemeTokens {
  id: string;
  name: string;
  category: string; // e.g. "love", "raksha-bandhan", "birthday"
  vibe: string;
  atmosphere: string;
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  shadows: ShadowTokens;
  motion: MotionTokens;
  particles: ParticleTokens;
  paper?: PaperTokens;
}
