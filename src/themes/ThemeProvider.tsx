// ─────────────────────────────────────────────────────────────────
// ThemeProvider — React Context & CSS Custom Properties Injector
// ─────────────────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import type { ThemeTokens } from "./types";
import { defaultLoveTheme } from "./love";

const ThemeContext = createContext<ThemeTokens>(defaultLoveTheme);

export function useThemeTokens(): ThemeTokens {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  theme: ThemeTokens;
  children: ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const c = theme.colors;
    const t = theme.typography;
    const s = theme.spacing;
    const r = theme.radius;
    const sh = theme.shadows;
    const m = theme.motion;

    // Inject Color Tokens as CSS Variables
    root.style.setProperty("--theme-bg", c.background);
    root.style.setProperty("--theme-surface", c.surface);
    root.style.setProperty("--theme-surface-container", c.surfaceContainer);
    root.style.setProperty("--theme-text-primary", c.textPrimary);
    root.style.setProperty("--theme-text-muted", c.textMuted);
    root.style.setProperty("--theme-accent-primary", c.accentPrimary);
    root.style.setProperty("--theme-accent-secondary", c.accentSecondary);
    root.style.setProperty("--theme-gold", c.goldAccent);
    root.style.setProperty("--theme-border", c.border);
    root.style.setProperty("--theme-glass-bg", c.glassBg);
    root.style.setProperty("--theme-glass-border", c.glassBorder);
    root.style.setProperty("--theme-paper-bg", c.paperBg);
    root.style.setProperty("--theme-shadow-color", c.shadowColor);
    root.style.setProperty("--theme-glow-color", c.glowColor);

    // Inject Typography Tokens
    root.style.setProperty("--theme-font-heading", t.fontHeading);
    root.style.setProperty("--theme-font-body", t.fontBody);
    if (t.fontAccent) root.style.setProperty("--theme-font-accent", t.fontAccent);

    // Inject Spacing & Radius Tokens
    root.style.setProperty("--theme-margin-desktop", s.marginDesktop);
    root.style.setProperty("--theme-margin-mobile", s.marginMobile);
    root.style.setProperty("--theme-section-gap", s.sectionGap);
    root.style.setProperty("--theme-radius-lg", r.lg);
    root.style.setProperty("--theme-radius-xl", r.xl);

    // Inject Motion Tokens
    root.style.setProperty("--theme-motion-fast", m.motionFast);
    root.style.setProperty("--theme-motion-normal", m.motionNormal);
    root.style.setProperty("--theme-motion-slow", m.motionSlow);
  }, [theme]);

  const value = useMemo(() => theme, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
