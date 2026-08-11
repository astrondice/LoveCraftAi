// ─────────────────────────────────────────────────────────────────
// DocumentaryChapter — Chapter Container with Sticky Progress Header
// ─────────────────────────────────────────────────────────────────
import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { useThemeTokens } from "@/themes";

interface DocumentaryChapterProps {
  chapterIndex: string; // e.g. "01"
  chapterTitle: string;
  chapterSubtitle?: string;
  children: ReactNode;
  className?: string;
}

export function DocumentaryChapter({
  chapterIndex,
  chapterTitle,
  chapterSubtitle,
  children,
  className = "",
}: DocumentaryChapterProps) {
  const theme = useThemeTokens();
  const c = theme.colors;

  return (
    <section className={`relative z-10 py-24 md:py-36 px-6 md:px-16 max-w-7xl mx-auto ${className}`}>
      {/* Chapter Header */}
      <div className="mb-16 text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[var(--theme-border)] bg-[var(--theme-glass-bg)] backdrop-blur-md mb-4"
        >
          <span className="font-mono text-xs font-bold" style={{ color: c.goldAccent }}>
            CHAPTER {chapterIndex}
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-3xl sm:text-5xl md:text-6xl text-[var(--theme-text-primary)] tracking-tight"
          style={{ fontFamily: theme.typography.fontHeading }}
        >
          {chapterTitle}
        </motion.h2>

        {chapterSubtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-4 text-base md:text-lg text-[var(--theme-text-muted)] font-light leading-relaxed"
          >
            {chapterSubtitle}
          </motion.p>
        )}
      </div>

      {/* Chapter Body */}
      <div className="relative">{children}</div>
    </section>
  );
}
