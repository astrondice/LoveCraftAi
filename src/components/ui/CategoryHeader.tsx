// ─────────────────────────────────────────────────────────────────
// CategoryHeader — Category Page Hero & Search/Filter Controls Bar
// ─────────────────────────────────────────────────────────────────
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, Sparkles, SlidersHorizontal, Layers } from "lucide-react";
import type { CategorySpec, CategorySortOption } from "@/types/category.types";

interface CategoryHeaderProps {
  category: CategorySpec;
  templateCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onlyFavorites: boolean;
  onToggleOnlyFavorites: () => void;
  favoritesCount: number;
  sortBy: CategorySortOption;
  onSortChange: (sort: CategorySortOption) => void;
  compareCount?: number;
  onOpenCompare?: () => void;
}

export function CategoryHeader({
  category,
  templateCount,
  searchQuery,
  onSearchChange,
  onlyFavorites,
  onToggleOnlyFavorites,
  favoritesCount,
  sortBy,
  onSortChange,
  compareCount = 0,
  onOpenCompare,
}: CategoryHeaderProps) {
  return (
    <div className="max-w-7xl mx-auto mb-8 space-y-6">
      {/* Dynamic Category Hero Section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative rounded-3xl p-6 md:p-10 overflow-hidden border border-ivory/10 bg-gradient-to-b from-ivory/[0.07] via-charcoal/50 to-charcoal/80 backdrop-blur-xl shadow-2xl"
        >
          {/* Subtle Ambient Glow Effect */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-2xl md:text-3xl">{category.emoji}</span>
                <span className="px-3 py-1 rounded-full border border-gold/30 bg-gold/10 text-gold label-caps text-[10px] font-bold tracking-wider">
                  {category.badge || category.name}
                </span>
                <span className="px-3 py-1 rounded-full border border-ivory/15 bg-ivory/5 text-ivory/60 label-caps text-[10px]">
                  {templateCount} {templateCount === 1 ? "Template" : "Templates"}
                </span>
              </div>

              <h2 className="font-display text-3xl md:text-5xl text-ivory leading-tight">
                {category.heroTitle || category.name}
              </h2>

              <p className="mt-3 text-ivory/70 text-sm md:text-base font-light leading-relaxed">
                {category.heroDescription || category.description}
              </p>
            </div>

            {/* Quick Stats Badges */}
            {category.popularTags && category.popularTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 md:justify-end max-w-sm">
                {category.popularTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-ivory/5 border border-ivory/10 text-ivory/60 text-[10px] label-caps tracking-wider"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Search, Sort & Filter Control Bar ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 rounded-2xl bg-charcoal/40 border border-ivory/10 backdrop-blur-md">
        {/* Real-time Search Input */}
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ivory/40" />
          <input
            type="text"
            placeholder={`Search ${category.name.toLowerCase()} templates, tags...`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-ivory/5 border border-ivory/15 focus:border-gold text-ivory text-xs placeholder:text-ivory/40 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ivory/5 border border-ivory/15 text-ivory/80 text-xs">
            <SlidersHorizontal size={13} className="text-gold" />
            <span className="label-caps text-[10px] text-ivory/50">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as CategorySortOption)}
              className="bg-transparent text-ivory text-xs label-caps outline-none cursor-pointer"
            >
              <option value="featured" className="bg-charcoal text-ivory">Featured</option>
              <option value="popular" className="bg-charcoal text-ivory">Popular</option>
              <option value="newest" className="bg-charcoal text-ivory">Newest</option>
              <option value="name" className="bg-charcoal text-ivory">Alphabetical</option>
            </select>
          </div>

          {/* Favorites Filter Toggle */}
          <button
            onClick={onToggleOnlyFavorites}
            className={`px-3.5 py-2 rounded-xl border text-xs label-caps transition-all flex items-center gap-1.5 ${
              onlyFavorites
                ? "bg-rose-500/20 border-rose-500 text-rose-300 font-bold shadow-md shadow-rose-500/20"
                : "bg-ivory/5 border-ivory/15 text-ivory/70 hover:text-ivory"
            }`}
          >
            <Heart size={13} className={onlyFavorites ? "fill-current text-rose-400" : ""} />
            Favorites ({favoritesCount})
          </button>

          {/* Compare Selected Button */}
          {compareCount > 0 && onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="px-3.5 py-2 rounded-xl bg-gold text-charcoal font-bold text-xs label-caps transition-all flex items-center gap-1.5 shadow-lg shadow-gold/20 hover:scale-105"
            >
              <Sparkles size={13} /> Compare ({compareCount}/2)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
