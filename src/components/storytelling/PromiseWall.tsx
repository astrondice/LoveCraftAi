// ─────────────────────────────────────────────────────────────────
// PromiseWall — Interactive Sacred Promise Cards Grid & Pledges
// ─────────────────────────────────────────────────────────────────
import { motion } from "framer-motion";
import { ShieldCheck, Heart, Sparkles } from "lucide-react";
import { useThemeTokens } from "@/themes";

export interface PromiseItem {
  id: string;
  title: string;
  promiseText: string;
  tag?: string;
}

interface PromiseWallProps {
  promises: PromiseItem[];
  className?: string;
}

export function PromiseWall({ promises, className = "" }: PromiseWallProps) {
  const theme = useThemeTokens();
  const c = theme.colors;

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promises.map((p, idx) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="p-6 md:p-8 rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-surface)] shadow-xl relative overflow-hidden group hover:border-[var(--theme-gold)] transition-all"
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} style={{ color: c.goldAccent }} />
                <span className="label-caps text-xs text-[var(--theme-text-muted)] font-semibold">
                  PROMISE {idx + 1}
                </span>
              </div>
              <Heart size={14} className="text-rose-500 fill-current opacity-80" />
            </div>

            {/* Promise Title */}
            <h4
              className="font-display text-xl md:text-2xl text-[var(--theme-text-primary)] mb-3"
              style={{ fontFamily: theme.typography.fontHeading }}
            >
              {p.title}
            </h4>

            {/* Promise Text */}
            <p className="text-sm text-[var(--theme-text-muted)] leading-relaxed font-light">
              "{p.promiseText}"
            </p>

            {/* Bottom Glow Bar */}
            <div
              className="mt-6 pt-4 border-t border-[var(--theme-border)] flex items-center justify-between text-[10px] label-caps tracking-widest text-[var(--theme-gold)]"
            >
              <span>✦ Sacred Vow</span>
              <Sparkles size={12} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
