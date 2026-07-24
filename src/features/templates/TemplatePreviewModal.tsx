// ─────────────────────────────────────────────────────────────────
// TemplatePreviewModal — Full-Screen Live Device Preview Experience
// ─────────────────────────────────────────────────────────────────
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  X,
  ArrowLeft,
  Rocket,
  Monitor,
  Laptop,
  Tablet,
  Smartphone,
  Sparkles,
  Check,
  Clock,
  Zap,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { TemplateSpec } from "@/lib/templates.data";
import { TEMPLATE_LIST } from "@/lib/templates.data";
import { renderBlueprint } from "@/lib/renderer/renderer";
import { THEMES } from "@/lib/themes";

interface TemplatePreviewModalProps {
  template: TemplateSpec | null;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (template: TemplateSpec) => void;
}

type DeviceMode = "desktop" | "laptop" | "tablet" | "mobile";

export function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
  onUseTemplate,
}: TemplatePreviewModalProps) {
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Generate live template HTML preview
  useEffect(() => {
    if (!template) return;
    setLoading(true);

    const theme = THEMES[template.id] ?? THEMES.cosmic;

    // Render interactive blueprint HTML snapshot
    const html = renderBlueprint({
      version: "1.0.0",
      websiteType: "love-story",
      theme: template.id,
      mood: "romantic",
      colorPalette: {
        background: theme.bg,
        text: "#faf9f6",
        primary: theme.c1,
        secondary: theme.c2,
        accent: theme.c3,
      },
      typography: {
        heading: "'Cormorant Garamond', serif",
        body: "'Space Mono', monospace",
      },
      animations: "cinematic",
      layout: "standard",
      seo: {
        title: `${template.name} — Interactive Preview`,
        description: template.description,
        keywords: template.tags,
        openGraph: { siteName: "LoveCraft AI" },
      },
      hero: {
        title: "Alex & Jordan",
        subtitle: "A Celestial Love Story",
        tagline: "Together since October 2021",
      },
      footer: {
        text: "Crafted with infinite love",
      },
    });

    setPreviewHtml(html);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [template]);

  // Keyboard Navigation: ESC to close, Arrow keys to cycle templates
  useEffect(() => {
    if (!isOpen || !template) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && template) {
        onUseTemplate(template);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, template, onClose, onUseTemplate]);

  if (!isOpen || !template) return null;

  const getDeviceWidth = () => {
    switch (device) {
      case "desktop":
        return "w-full max-w-[1440px]";
      case "laptop":
        return "w-full max-w-[1024px]";
      case "tablet":
        return "w-full max-w-[768px]";
      case "mobile":
        return "w-[375px]";
      default:
        return "w-full";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex flex-col bg-charcoal text-ivory overflow-hidden">
        {/* ── Top Header Navigation Bar ────────────────────────────── */}
        <div className="h-16 px-6 bg-charcoal/90 backdrop-blur-xl border-b border-ivory/10 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-ivory/5 hover:bg-ivory/15 text-ivory/80 hover:text-ivory label-caps text-[11px] transition-all"
            >
              <ArrowLeft size={14} /> Back to Gallery
            </button>

            <div className="h-4 w-px bg-ivory/15 hidden sm:block" />

            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg text-ivory">{template.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-gold/15 text-gold label-caps text-[9px] border border-gold/30">
                  {template.category}
                </span>
              </div>
            </div>
          </div>

          {/* Center Device Switcher Controls */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-ivory/5 border border-ivory/10">
            <button
              onClick={() => setDevice("desktop")}
              className={`p-2 rounded-xl text-xs label-caps flex items-center gap-1.5 transition-all ${
                device === "desktop" ? "bg-gold text-charcoal font-bold" : "text-ivory/60 hover:text-ivory"
              }`}
              title="Desktop View (1440px)"
            >
              <Monitor size={14} /> <span className="hidden lg:inline">Desktop</span>
            </button>

            <button
              onClick={() => setDevice("laptop")}
              className={`p-2 rounded-xl text-xs label-caps flex items-center gap-1.5 transition-all ${
                device === "laptop" ? "bg-gold text-charcoal font-bold" : "text-ivory/60 hover:text-ivory"
              }`}
              title="Laptop View (1024px)"
            >
              <Laptop size={14} /> <span className="hidden lg:inline">Laptop</span>
            </button>

            <button
              onClick={() => setDevice("tablet")}
              className={`p-2 rounded-xl text-xs label-caps flex items-center gap-1.5 transition-all ${
                device === "tablet" ? "bg-gold text-charcoal font-bold" : "text-ivory/60 hover:text-ivory"
              }`}
              title="Tablet View (768px)"
            >
              <Tablet size={14} /> <span className="hidden lg:inline">Tablet</span>
            </button>

            <button
              onClick={() => setDevice("mobile")}
              className={`p-2 rounded-xl text-xs label-caps flex items-center gap-1.5 transition-all ${
                device === "mobile" ? "bg-gold text-charcoal font-bold" : "text-ivory/60 hover:text-ivory"
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone size={14} /> <span className="hidden lg:inline">Mobile</span>
            </button>
          </div>

          {/* Right Action Header Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInfoPanel(!showInfoPanel)}
              className={`p-2 rounded-full border transition-all ${
                showInfoPanel ? "bg-gold/20 border-gold text-gold" : "bg-ivory/5 border-ivory/15 text-ivory/70 hover:text-ivory"
              }`}
              title="Template Specs & Features"
            >
              <Info size={16} />
            </button>

            <button
              onClick={() => onUseTemplate(template)}
              className="px-5 py-2 rounded-full bg-gold hover:bg-gold-light text-charcoal font-bold text-xs label-caps flex items-center gap-2 shadow-lg shadow-gold/15 transition-all"
            >
              <Rocket size={14} /> Use Template
            </button>
          </div>
        </div>

        {/* ── Main Preview Body Canvas ─────────────────────────────── */}
        <div className="flex-1 relative flex items-center justify-center p-4 lg:p-8 bg-charcoal/90 overflow-hidden">
          {/* Side Specs Panel Drawer */}
          <AnimatePresence>
            {showInfoPanel && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="absolute right-6 top-6 bottom-6 w-80 glass-panel rounded-3xl p-6 z-40 border border-ivory/15 shadow-2xl overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl text-ivory">Template Specs</h3>
                  <button
                    onClick={() => setShowInfoPanel(false)}
                    className="p-1 rounded-full text-ivory/40 hover:text-ivory"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-ivory/40 label-caps text-[9px] block">Vibe & Atmosphere</span>
                    <p className="text-ivory/90 mt-1 font-medium">{template.atmosphere}</p>
                  </div>

                  <div>
                    <span className="text-ivory/40 label-caps text-[9px] block">Perfect For</span>
                    <p className="text-gold mt-1 font-semibold">{template.perfectFor}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 py-2">
                    <div className="p-2.5 rounded-xl bg-ivory/5 border border-ivory/10">
                      <Clock size={12} className="text-gold mb-1" />
                      <span className="text-ivory/40 text-[9px] block">Setup Time</span>
                      <span className="font-bold text-ivory">{template.setupTime}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-ivory/5 border border-ivory/10">
                      <Zap size={12} className="text-emerald-400 mb-1" />
                      <span className="text-ivory/40 text-[9px] block">Performance</span>
                      <span className="font-bold text-emerald-400">{template.performanceScore}/100</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-ivory/40 label-caps text-[9px] block mb-2">Features Included</span>
                    <div className="space-y-1.5">
                      {template.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-ivory/80">
                          <Check size={12} className="text-gold" /> {feat}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resizable Device Container Frame */}
          <motion.div
            layout
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={`h-full ${getDeviceWidth()} transition-all duration-300 rounded-2xl overflow-hidden border border-ivory/20 shadow-2xl bg-black relative flex flex-col`}
          >
            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-charcoal text-center">
                <Sparkles size={36} className="text-gold animate-spin mb-3" />
                <p className="font-display text-xl text-ivory">Loading Live Preview…</p>
              </div>
            ) : (
              <iframe
                srcDoc={previewHtml}
                title={template.name}
                className="w-full h-full border-0 bg-black"
                sandbox="allow-scripts allow-same-origin"
              />
            )}
          </motion.div>
        </div>

        {/* ── Sticky Bottom Action Bar ─────────────────────────────── */}
        <div className="h-16 px-6 bg-charcoal/90 backdrop-blur-xl border-t border-ivory/10 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 text-xs text-ivory/60">
            <span>Use ESC to exit</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full border border-ivory/20 hover:border-ivory/40 text-ivory/80 hover:text-ivory label-caps text-[11px] transition-all"
            >
              Back to Gallery
            </button>

            <button
              onClick={() => onUseTemplate(template)}
              className="px-6 py-2.5 rounded-full bg-gold hover:bg-gold-light text-charcoal font-bold text-xs label-caps flex items-center gap-2 shadow-xl shadow-gold/20 transition-all"
            >
              <Rocket size={14} /> Use This Template
            </button>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}
