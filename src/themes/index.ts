// ─────────────────────────────────────────────────────────────────
// Enterprise Theme System Registry & Active Theme Resolver
// ─────────────────────────────────────────────────────────────────
import type { ThemeTokens } from "./types";
import { defaultLoveTheme } from "./love";
import { RAKSHA_BANDHAN_THEMES, rakhiBondTheme } from "./raksha-bandhan";
import { defaultBirthdayTheme } from "./birthday";

export * from "./types";
export * from "./ThemeProvider";

export const GLOBAL_THEME_REGISTRY: Record<string, ThemeTokens> = {
  // Love themes
  cosmic: defaultLoveTheme,
  memories: defaultLoveTheme,
  rose: defaultLoveTheme,
  dream: defaultLoveTheme,
  cinematic: defaultLoveTheme,
  proposal: defaultLoveTheme,
  moonlight: defaultLoveTheme,
  golden: defaultLoveTheme,
  sakura: defaultLoveTheme,
  eternal: defaultLoveTheme,

  // Raksha Bandhan themes
  ...RAKSHA_BANDHAN_THEMES,

  // Birthday themes
  "bday-memories": defaultBirthdayTheme,
};

/**
 * Resolves theme tokens by theme ID with fallback to defaultLoveTheme
 */
export function getThemeById(themeId: string): ThemeTokens {
  if (!themeId) return defaultLoveTheme;
  const match = GLOBAL_THEME_REGISTRY[themeId.toLowerCase()];
  if (match) return match;

  if (themeId.startsWith("rakhi-")) {
    return rakhiBondTheme;
  }
  return defaultLoveTheme;
}
