// ─────────────────────────────────────────────────────────────────
// Category & Template Lifecycle Service Layer
// Strict Visibility Enforcement & Admin Management Primitives
// ─────────────────────────────────────────────────────────────────
import { supabase } from "@/lib/supabase";
import { CATEGORY_LIST, getCategoryBySlug } from "@/lib/categories.data";
import { TEMPLATE_LIST, type TemplateSpec } from "@/lib/templates.data";
import type { CategorySpec, TemplateStatus } from "@/types/category.types";

export class CategoryService {
  /**
   * Fetches active categories from Supabase database with fallback to static registry
   */
  async getCategories(): Promise<CategorySpec[]> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_hidden", false)
        .order("sort_order", { ascending: true });

      if (error || !data || data.length === 0) {
        return CATEGORY_LIST;
      }

      return data.map((item) => ({
        id: item.slug,
        slug: item.slug,
        name: item.name,
        emoji: item.emoji || "✨",
        description: item.description || "",
        badge: item.badge || undefined,
        featured: item.is_featured || false,
        isHidden: item.is_hidden || false,
        sortOrder: item.sort_order || 0,
        heroTitle: item.hero_title || item.name,
        heroDescription: item.hero_description || item.description || "",
        accentGradient: item.accent_gradient || undefined,
        popularTags: item.popular_tags || [],
      }));
    } catch {
      return CATEGORY_LIST;
    }
  }

  /**
   * Gets single category metadata by slug
   */
  getCategory(slug: string): CategorySpec {
    return getCategoryBySlug(slug);
  }

  /**
   * Fetches templates filtered by category slug and lifecycle status.
   * CRITICAL SECURITY RULE: Public users ONLY get status === 'published'.
   */
  getTemplates(categorySlug: string = "all", includeUnpublished: boolean = false): TemplateSpec[] {
    let list = TEMPLATE_LIST;

    // Filter out non-published templates unless admin requests includeUnpublished
    if (!includeUnpublished) {
      list = list.filter((t) => t.status === "published");
    }

    if (!categorySlug || categorySlug === "all") {
      return list;
    }

    return list.filter(
      (t) =>
        t.category.toLowerCase() === categorySlug.toLowerCase() ||
        t.subCategory?.toLowerCase() === categorySlug.toLowerCase()
    );
  }

  /**
   * Security Guard: Verifies if a user has permission to view/use a template.
   * Regular users CANNOT access or build with unpublished templates.
   */
  canUserUseTemplate(templateId: string, userRole?: string): boolean {
    const template = TEMPLATE_LIST.find((t) => t.id === templateId);
    if (!template) return false;

    // Published templates are available to everyone
    if (template.status === "published") return true;

    // Unpublished templates are ONLY available to admins & superadmins
    return userRole === "admin" || userRole === "superadmin";
  }

  /**
   * Search and filter templates efficiently with lifecycle status rules
   */
  filterTemplates(
    categorySlug: string = "all",
    searchQuery: string = "",
    onlyFavorites: boolean = false,
    favoritesSet: Set<string> = new Set(),
    sortBy: "featured" | "popular" | "newest" | "name" = "featured",
    includeUnpublished: boolean = false,
    statusFilter: TemplateStatus | "all" = "all"
  ): TemplateSpec[] {
    let list = this.getTemplates(categorySlug, includeUnpublished);

    // Apply specific status filter if requested in admin mode
    if (includeUnpublished && statusFilter !== "all") {
      list = list.filter((t) => t.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.categoryName.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    if (onlyFavorites) {
      list = list.filter((t) => favoritesSet.has(t.id));
    }

    // Apply sorting
    return [...list].sort((a, b) => {
      if (sortBy === "popular") {
        return (b.badge === "Popular" ? 1 : 0) - (a.badge === "Popular" ? 1 : 0);
      }
      if (sortBy === "newest") {
        return (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0);
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      // Default "featured"
      return (b.badge === "Featured" ? 1 : 0) - (a.badge === "Featured" ? 1 : 0);
    });
  }

  // ═════════════════════════════════════════════════════════════════
  // ADMIN LIFECYCLE MANAGEMENT METHODS
  // ═════════════════════════════════════════════════════════════════

  /**
   * Updates template lifecycle status (Draft -> Development -> Review -> QA -> Ready -> Published -> Archived)
   */
  async updateTemplateStatus(
    templateId: string,
    newStatus: TemplateStatus
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Local state sync
      const tmpl = TEMPLATE_LIST.find((t) => t.id === templateId);
      if (tmpl) {
        tmpl.status = newStatus;
      }

      // Supabase DB sync
      const { error } = await supabase
        .from("templates")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", templateId);

      if (error) {
        console.warn("[CategoryService] DB status sync note:", error.message);
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update template status";
      return { success: false, error: msg };
    }
  }

  async publishTemplate(templateId: string): Promise<{ success: boolean; error?: string }> {
    return this.updateTemplateStatus(templateId, "published");
  }

  async archiveTemplate(templateId: string): Promise<{ success: boolean; error?: string }> {
    return this.updateTemplateStatus(templateId, "archived");
  }

  async addCategory(category: Partial<CategorySpec>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from("categories").insert({
        slug: category.slug || category.id,
        name: category.name,
        emoji: category.emoji,
        description: category.description,
        badge: category.badge,
        is_featured: category.featured ?? false,
        is_hidden: category.isHidden ?? false,
        sort_order: category.sortOrder ?? 99,
        hero_title: category.heroTitle,
        hero_description: category.heroDescription,
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add category";
      return { success: false, error: msg };
    }
  }

  async updateCategory(
    id: string,
    updates: Partial<CategorySpec>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("categories")
        .update({
          name: updates.name,
          emoji: updates.emoji,
          description: updates.description,
          badge: updates.badge,
          is_featured: updates.featured,
          is_hidden: updates.isHidden,
          sort_order: updates.sortOrder,
          hero_title: updates.heroTitle,
          hero_description: updates.heroDescription,
          updated_at: new Date().toISOString(),
        })
        .eq("slug", id);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update category";
      return { success: false, error: msg };
    }
  }

  async deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from("categories").delete().eq("slug", id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete category";
      return { success: false, error: msg };
    }
  }

  async toggleHideCategory(id: string, isHidden: boolean): Promise<{ success: boolean }> {
    return this.updateCategory(id, { isHidden });
  }

  async reorderCategories(orderedSlugs: string[]): Promise<{ success: boolean }> {
    try {
      for (let i = 0; i < orderedSlugs.length; i++) {
        await supabase
          .from("categories")
          .update({ sort_order: i })
          .eq("slug", orderedSlugs[i]);
      }
      return { success: true };
    } catch {
      return { success: false };
    }
  }
}

export const categoryService = new CategoryService();
