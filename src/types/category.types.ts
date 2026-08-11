// ─────────────────────────────────────────────────────────────────
// Category System Types & Template Lifecycle Architecture
// ─────────────────────────────────────────────────────────────────

export type TemplateStatus =
  | "draft"
  | "development"
  | "review"
  | "testing"
  | "ready"
  | "published"
  | "archived";

export interface CategorySpec {
  id: string; // Slug identifier, e.g. "love", "raksha-bandhan", "birthday"
  slug: string;
  name: string;
  emoji: string;
  description: string;
  badge?: string;
  featured?: boolean;
  isHidden?: boolean;
  sortOrder: number;
  heroTitle: string;
  heroDescription: string;
  accentGradient?: string;
  popularTags?: string[];
  totalTemplates?: number;
}

export interface CategoryFilter {
  categoryId: string;
  searchQuery: string;
  onlyFavorites: boolean;
  sortBy: "featured" | "popular" | "newest" | "name";
  statusFilter?: TemplateStatus | "all";
}

export type CategorySortOption = "featured" | "popular" | "newest" | "name";
