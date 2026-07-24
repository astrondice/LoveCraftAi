// ─────────────────────────────────────────────────────────────────
// TemplateCard — Premium Framer/Webflow-grade Template Card
// ─────────────────────────────────────────────────────────────────
import { motion } from "framer-motion";
import { Eye, Rocket, Heart, Clock, Sparkles, Smartphone, Search, Moon } from "lucide-react";
import type { TemplateSpec } from "@/lib/templates.data";

interface TemplateCardProps {
  template: TemplateSpec;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onView: (template: TemplateSpec) => void;
  onUse: (template: TemplateSpec) => void;
  onCompareSelect?: (template: TemplateSpec) => void;
}

export function TemplateCard({
  template,
  isFavorite,
  onToggleFavorite,
  onView,
  onUse,
}: TemplateCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="glass-panel rounded-3xl overflow-hidden border border-ivory/10 hover:border-gold/40 shadow-xl hover:shadow-2xl hover:shadow-gold/5 flex flex-col group relative"
    >
      {/* Thumbnail Header Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-charcoal/50">
        <img
          src={template.thumbnail}
          alt={template.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
            {template.badge && (
              <span
                className={`px-2.5 py-0.5 rounded-full label-caps text-[9px] font-bold shadow-md ${
                  template.badge === "Popular"
                    ? "bg-gold text-charcoal"
                    : template.badge === "New"
                    ? "bg-sky-500 text-white"
                    : "bg-purple-500 text-white"
                }`}
              >
                {template.badge}
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full bg-charcoal/70 backdrop-blur border border-ivory/15 text-ivory/80 label-caps text-[9px]">
              {template.category}
            </span>
          </div>

          {/* Favorite Heart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(template.id);
            }}
            className={`w-8 h-8 rounded-full grid place-items-center backdrop-blur transition-all ${
              isFavorite
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                : "bg-charcoal/60 text-ivory/60 hover:text-rose-400 border border-ivory/15"
            }`}
            title={isFavorite ? "Remove from favorites" : "Save to favorites"}
          >
            <Heart size={14} className={isFavorite ? "fill-current" : ""} />
          </button>
        </div>

        {/* Setup Time Badge */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-charcoal/80 backdrop-blur border border-ivory/15 text-ivory/70 label-caps text-[9px]">
          <Clock size={10} className="text-gold" />
          <span>{template.setupTime} setup</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display text-xl text-ivory group-hover:text-gold transition-colors">
              {template.name}
            </h3>
          </div>
          <p className="text-ivory/60 text-xs line-clamp-2 mb-4 leading-relaxed">
            {template.description}
          </p>

          {/* Feature Badges Grid */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {template.aiReady && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ivory/5 border border-ivory/10 text-ivory/60 text-[9px] label-caps">
                <Sparkles size={9} className="text-gold" /> AI Ready
              </span>
            )}
            {template.responsive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ivory/5 border border-ivory/10 text-ivory/60 text-[9px] label-caps">
                <Smartphone size={9} className="text-sky-400" /> Responsive
              </span>
            )}
            {template.seoReady && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ivory/5 border border-ivory/10 text-ivory/60 text-[9px] label-caps">
                <Search size={9} className="text-emerald-400" /> SEO Ready
              </span>
            )}
            {template.darkMode && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ivory/5 border border-ivory/10 text-ivory/60 text-[9px] label-caps">
                <Moon size={9} className="text-purple-400" /> Dark Mode
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons Footer — Exactly 2 buttons */}
        <div className="flex items-center gap-2.5 pt-2 border-t border-ivory/10">
          <button
            onClick={() => onView(template)}
            className="flex-1 py-2.5 rounded-xl border border-ivory/20 hover:border-ivory/40 bg-ivory/5 hover:bg-ivory/15 text-ivory text-xs font-semibold label-caps flex items-center justify-center gap-1.5 transition-all"
          >
            <Eye size={13} /> View Template
          </button>

          <button
            onClick={() => onUse(template)}
            className="flex-1 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-charcoal font-bold text-xs label-caps flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-gold/10"
          >
            <Rocket size={13} /> Use Template
          </button>
        </div>
      </div>
    </motion.div>
  );
}
