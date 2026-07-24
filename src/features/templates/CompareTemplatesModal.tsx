// ─────────────────────────────────────────────────────────────────
// CompareTemplatesModal — Side-by-side template comparison modal
// ─────────────────────────────────────────────────────────────────
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Check, Rocket, Zap, Clock } from "lucide-react";
import type { TemplateSpec } from "@/lib/templates.data";

interface CompareTemplatesModalProps {
  t1: TemplateSpec | null;
  t2: TemplateSpec | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (t: TemplateSpec) => void;
}

export function CompareTemplatesModal({
  t1,
  t2,
  isOpen,
  onClose,
  onSelectTemplate,
}: CompareTemplatesModalProps) {
  if (!isOpen || !t1 || !t2) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-charcoal/85 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3 }}
          className="glass-panel rounded-3xl p-6 md:p-8 w-full max-w-4xl relative z-10 overflow-hidden shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full grid place-items-center text-ivory/40 hover:text-ivory hover:bg-ivory/10 transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gold/15 border border-gold/30 grid place-items-center text-gold">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-display text-2xl text-ivory">Template Comparison</h2>
              <p className="label-caps text-gold text-[10px] mt-0.5">Compare features side-by-side</p>
            </div>
          </div>

          {/* Side-by-Side Comparison Grid */}
          <div className="grid grid-cols-2 gap-6 border-t border-ivory/10 pt-6">
            {/* Template 1 */}
            <div className="space-y-4">
              <div className="aspect-video rounded-2xl overflow-hidden relative border border-ivory/15">
                <img src={t1.thumbnail} alt={t1.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 font-display text-xl text-ivory">{t1.name}</span>
              </div>

              <div>
                <span className="text-ivory/40 label-caps text-[9px] block">Category</span>
                <span className="text-gold text-xs font-semibold">{t1.category}</span>
              </div>

              <div>
                <span className="text-ivory/40 label-caps text-[9px] block">Vibe & Atmosphere</span>
                <p className="text-ivory/80 text-xs mt-1">{t1.atmosphere}</p>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 p-2.5 rounded-xl bg-ivory/5 border border-ivory/10 text-xs">
                  <Clock size={12} className="text-gold mb-1" />
                  <span className="text-ivory/40 text-[9px] block">Setup</span>
                  <span className="font-bold text-ivory">{t1.setupTime}</span>
                </div>
                <div className="flex-1 p-2.5 rounded-xl bg-ivory/5 border border-ivory/10 text-xs">
                  <Zap size={12} className="text-emerald-400 mb-1" />
                  <span className="text-ivory/40 text-[9px] block">Score</span>
                  <span className="font-bold text-emerald-400">{t1.performanceScore}/100</span>
                </div>
              </div>

              <button
                onClick={() => onSelectTemplate(t1)}
                className="w-full py-3 rounded-2xl bg-gold text-charcoal font-bold label-caps text-[11px] flex items-center justify-center gap-2"
              >
                <Rocket size={14} /> Choose {t1.name}
              </button>
            </div>

            {/* Template 2 */}
            <div className="space-y-4 border-l border-ivory/10 pl-6">
              <div className="aspect-video rounded-2xl overflow-hidden relative border border-ivory/15">
                <img src={t2.thumbnail} alt={t2.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 font-display text-xl text-ivory">{t2.name}</span>
              </div>

              <div>
                <span className="text-ivory/40 label-caps text-[9px] block">Category</span>
                <span className="text-gold text-xs font-semibold">{t2.category}</span>
              </div>

              <div>
                <span className="text-ivory/40 label-caps text-[9px] block">Vibe & Atmosphere</span>
                <p className="text-ivory/80 text-xs mt-1">{t2.atmosphere}</p>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 p-2.5 rounded-xl bg-ivory/5 border border-ivory/10 text-xs">
                  <Clock size={12} className="text-gold mb-1" />
                  <span className="text-ivory/40 text-[9px] block">Setup</span>
                  <span className="font-bold text-ivory">{t2.setupTime}</span>
                </div>
                <div className="flex-1 p-2.5 rounded-xl bg-ivory/5 border border-ivory/10 text-xs">
                  <Zap size={12} className="text-emerald-400 mb-1" />
                  <span className="text-ivory/40 text-[9px] block">Score</span>
                  <span className="font-bold text-emerald-400">{t2.performanceScore}/100</span>
                </div>
              </div>

              <button
                onClick={() => onSelectTemplate(t2)}
                className="w-full py-3 rounded-2xl bg-gold text-charcoal font-bold label-caps text-[11px] flex items-center justify-center gap-2"
              >
                <Rocket size={14} /> Choose {t2.name}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
