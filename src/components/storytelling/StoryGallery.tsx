// ─────────────────────────────────────────────────────────────────
// StoryGallery — Progressive Image Grid & Lightbox Viewer
// Supports WebP, Skeleton Loaders, Blur-up & Keyboard Navigation
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useThemeTokens } from "@/themes";

export interface GalleryItem {
  id: string;
  url: string;
  caption?: string;
  date?: string;
  tag?: string;
}

interface StoryGalleryProps {
  items: GalleryItem[];
  columns?: number;
  className?: string;
}

export function StoryGallery({ items, className = "" }: StoryGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loadedMap, setLoadedMap] = useState<Record<string, boolean>>({});
  const theme = useThemeTokens();
  const c = theme.colors;

  const handleImageLoad = (id: string) => {
    setLoadedMap((prev) => ({ ...prev, [id]: true }));
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : items.length - 1));
      }
      if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev !== null && prev < items.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, items.length]);

  return (
    <div className={`w-full ${className}`}>
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => {
          const isLoaded = loadedMap[item.id];

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedIndex(idx)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] shadow-lg"
            >
              {/* Skeleton Placeholder */}
              {!isLoaded && (
                <div className="absolute inset-0 bg-white/5 animate-pulse flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
                </div>
              )}

              {/* Aspect Ratio Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src={item.url}
                  alt={item.caption || "Story memory"}
                  loading="lazy"
                  onLoad={() => handleImageLoad(item.id)}
                  className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
                    isLoaded ? "opacity-100 filter-none" : "opacity-0 blur-md"
                  }`}
                />

                {/* Ambient Overlay & Hover Action */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-bg)] via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <span className="w-8 h-8 rounded-full bg-[var(--theme-glass-bg)] border border-[var(--theme-border)] backdrop-blur grid place-items-center text-[var(--theme-text-primary)]">
                    <Maximize2 size={14} style={{ color: c.goldAccent }} />
                  </span>
                </div>

                {/* Caption Footer */}
                {item.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    {item.date && (
                      <span className="label-caps text-[10px] text-[var(--theme-text-muted)] block mb-1">
                        {item.date}
                      </span>
                    )}
                    <p className="text-xs text-[var(--theme-text-primary)] font-medium line-clamp-2">
                      {item.caption}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Fullscreen Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center z-50 transition-all"
              aria-label="Close viewer"
            >
              <X size={18} />
            </button>

            {/* Previous Image */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : items.length - 1));
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center z-50 transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Active Image Box */}
            <div
              className="relative max-w-5xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/20 bg-black/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={items[selectedIndex].url}
                alt={items[selectedIndex].caption || "Memory detail"}
                className="max-h-[75vh] w-auto object-contain mx-auto"
              />
              {items[selectedIndex].caption && (
                <div className="p-4 text-center bg-black/60 backdrop-blur">
                  <p className="text-sm text-white font-medium">
                    {items[selectedIndex].caption}
                  </p>
                </div>
              )}
            </div>

            {/* Next Image */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev !== null && prev < items.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center z-50 transition-all"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
