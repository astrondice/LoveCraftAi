// ─────────────────────────────────────────────────────────────────
// CategoryNavigation — Premium Animated Category Pills Navigation
// Apple-Quality Spacing, Glassmorphism & Framer Motion Transitions
// ─────────────────────────────────────────────────────────────────
import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import type { CategorySpec } from "@/types/category.types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryNavigationProps {
  categories: CategorySpec[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  className?: string;
}

export function CategoryNavigation({
  categories,
  activeCategoryId,
  onSelectCategory,
  className = "",
}: CategoryNavigationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Auto scroll active pill into view when changed
  useEffect(() => {
    if (!scrollRef.current) return;
    const activeEl = scrollRef.current.querySelector<HTMLElement>(`[data-category-id="${activeCategoryId}"]`);
    if (activeEl) {
      const container = scrollRef.current;
      const containerLeft = container.scrollLeft;
      const containerRight = containerLeft + container.clientWidth;
      const elLeft = activeEl.offsetLeft - 32;
      const elRight = elLeft + activeEl.clientWidth + 64;

      if (elLeft < containerLeft || elRight > containerRight) {
        container.scrollTo({ left: elLeft - 16, behavior: "smooth" });
      }
    }
  }, [activeCategoryId]);

  return (
    <div className={`relative group/nav max-w-7xl mx-auto ${className}`}>
      {/* Scroll Left Button */}
      <button
        onClick={() => scroll("left")}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-charcoal/80 border border-ivory/20 text-ivory/70 hover:text-ivory hover:border-gold/60 backdrop-blur-md hidden md:grid place-items-center opacity-0 group-hover/nav:opacity-100 transition-all shadow-lg"
        aria-label="Scroll left"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Categories Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2.5 overflow-x-auto py-2.5 px-1 scrollbar-none scroll-smooth relative"
      >
        {categories.map((cat) => {
          const isActive = activeCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              data-category-id={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`relative px-4 py-2.5 rounded-full text-xs font-semibold label-caps transition-colors duration-300 flex items-center gap-2 whitespace-nowrap select-none outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                isActive ? "text-charcoal font-bold" : "text-ivory/70 hover:text-ivory"
              }`}
            >
              {/* Active Animated Sliding Background Glow */}
              {isActive && (
                <motion.div
                  layoutId="activeCategoryPill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-gold via-amber-300 to-gold shadow-lg shadow-gold/25 z-0"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              {/* Inactive Subtle Glass Background */}
              {!isActive && (
                <div className="absolute inset-0 rounded-full bg-ivory/5 hover:bg-ivory/12 border border-ivory/12 hover:border-ivory/25 transition-all z-0 backdrop-blur-md" />
              )}

              {/* Category Emoji & Title */}
              <span className="relative z-10 text-sm leading-none">{cat.emoji}</span>
              <span className="relative z-10 tracking-wider">{cat.name}</span>

              {/* Optional Category Badge */}
              {cat.badge && (
                <span
                  className={`relative z-10 px-1.5 py-0.5 rounded-full text-[9px] font-bold label-caps ${
                    isActive
                      ? "bg-charcoal/20 text-charcoal"
                      : "bg-gold/20 border border-gold/40 text-gold"
                  }`}
                >
                  {cat.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => scroll("right")}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-charcoal/80 border border-ivory/20 text-ivory/70 hover:text-ivory hover:border-gold/60 backdrop-blur-md hidden md:grid place-items-center opacity-0 group-hover/nav:opacity-100 transition-all shadow-lg"
        aria-label="Scroll right"
      >
        <ChevronRight size={16} />
      </button>

      {/* Gradient Fades for Smooth Scroll Edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-charcoal to-transparent z-10 md:hidden" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-charcoal to-transparent z-10 md:hidden" />
    </div>
  );
}
