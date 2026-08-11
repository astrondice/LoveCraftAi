// ─────────────────────────────────────────────────────────────────
// InteractiveTimeline — Milestone Journey Timeline Component
// ─────────────────────────────────────────────────────────────────
import { motion } from "framer-motion";
import { Clock, Star } from "lucide-react";
import { useThemeTokens } from "@/themes";

export interface TimelineEvent {
  id: string;
  yearOrDate: string;
  title: string;
  description: string;
  tag?: string;
  imageUrl?: string;
}

interface InteractiveTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function InteractiveTimeline({ events, className = "" }: InteractiveTimelineProps) {
  const theme = useThemeTokens();
  const c = theme.colors;

  return (
    <div className={`relative max-w-4xl mx-auto ${className}`}>
      {/* Central Connector Thread Line */}
      <div
        className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 opacity-40 z-0"
        style={{
          background: `linear-gradient(to bottom, transparent, ${c.goldAccent}, ${c.accentPrimary}, transparent)`,
        }}
      />

      <div className="space-y-12 relative z-10">
        {events.map((event, idx) => {
          const isEven = idx % 2 === 0;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`flex flex-col md:flex-row items-center ${
                isEven ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Event Content Card */}
              <div className="w-full md:w-1/2 pl-12 md:pl-0 md:px-8">
                <div
                  className="rounded-2xl p-6 border border-[var(--theme-border)] bg-[var(--theme-surface)] shadow-lg hover:shadow-xl transition-all group"
                  style={{ borderRadius: theme.radius.lg }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full label-caps text-[10px] font-bold border border-[var(--theme-border)]"
                      style={{ color: c.goldAccent, backgroundColor: c.glassBg }}
                    >
                      {event.yearOrDate}
                    </span>
                    {event.tag && (
                      <span className="label-caps text-[9px] text-[var(--theme-text-muted)]">
                        {event.tag}
                      </span>
                    )}
                  </div>

                  <h3
                    className="font-display text-xl md:text-2xl text-[var(--theme-text-primary)] group-hover:text-[var(--theme-gold)] transition-colors mb-2"
                    style={{ fontFamily: theme.typography.fontHeading }}
                  >
                    {event.title}
                  </h3>

                  <p className="text-xs md:text-sm text-[var(--theme-text-muted)] leading-relaxed font-light">
                    {event.description}
                  </p>

                  {event.imageUrl && (
                    <div className="mt-4 rounded-xl overflow-hidden aspect-[16/9]">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline Center Node Badge */}
              <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border border-[var(--theme-border)] bg-[var(--theme-bg)] backdrop-blur grid place-items-center z-10 shadow-md">
                <Star size={12} style={{ color: c.goldAccent }} />
              </div>

              {/* Spacer for 2-column Desktop layout */}
              <div className="hidden md:block w-1/2" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
