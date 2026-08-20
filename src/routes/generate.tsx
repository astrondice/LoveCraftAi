import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import JSZip from "jszip";
import { BackgroundFX } from "@/components/animations/BackgroundFX";
import { GlassCard } from "@/components/ui/GlassCard";
import { Logo } from "@/components/ui/Logo";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useLovecraft, type MediaFile } from "@/lib/store";
import { THEME_LIST, THEMES } from "@/lib/themes";
import { buildReadme } from "@/lib/buildSite";
import { GenerationEngine } from "@/services/generation/engine";
import { renderBlueprint } from "@/lib/renderer/renderer";
import { AutoSaveIndicator } from "@/components/ui/AutoSaveIndicator";
import { draftRecovery } from "@/lib/draft-recovery";
import { useAuth } from "@/hooks/use-auth";
import { getPendingPublish, getPendingPublishAction } from "@/lib/pending-publish";

import { TemplateCard } from "@/features/templates/TemplateCard";
import { TEMPLATE_LIST, TEMPLATES_DATA, type TemplateSpec } from "@/lib/templates.data";
import { CATEGORY_LIST, getCategoryBySlug } from "@/lib/categories.data";
import { toast } from "sonner";
import { CategoryNavigation } from "@/components/ui/CategoryNavigation";
import { CategoryHeader } from "@/components/ui/CategoryHeader";
import { categoryService } from "@/services/category.service";
import type { CategorySortOption } from "@/types/category.types";



// Lazy-loaded modal components for code splitting & bundle optimization
const PublishModal = lazy(() =>
  import("@/features/publish/PublishModal").then((m) => ({ default: m.PublishModal }))
);
const TemplatePreviewModal = lazy(() =>
  import("@/features/templates/TemplatePreviewModal").then((m) => ({ default: m.TemplatePreviewModal }))
);
const CompareTemplatesModal = lazy(() =>
  import("@/features/templates/CompareTemplatesModal").then((m) => ({ default: m.CompareTemplatesModal }))
);
import {
  Upload,
  Music,
  Film,
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Download,
  Share2,
  Globe,
  LayoutDashboard,
  Eye,
} from "lucide-react";

export const Route = createFileRoute("/generate")({
  head: () => ({
    meta: [
      { title: "Create Your Website — LoveCraft.ai" },
      {
        name: "description",
        content: "Compose your cinematic website in four steps with AI.",
      },
      // Application wizard — not indexable content
      { name: "robots", content: "noindex,nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://lovecraft.ai/generate" }],
  }),
  component: GeneratePage,
});

const STEPS = ["The Story", "Memories", "Universe", "The Moment"];

function GeneratePage() {
  const s = useLovecraft();
  const [showResume, setShowResume] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);

  const { user, isAuthenticated, isLoading } = useAuth();


  // 30-second Auto-save timer
  useEffect(() => {
    if (!s.name1 && !s.name2) return;

    const saveTimer = setInterval(async () => {
      setSaveStatus("saving");
      try {
        const savedDate = await draftRecovery.saveDraft(
          {
            name1: s.name1,
            name2: s.name2,
            date: s.date,
            duration: s.duration,
            memory: s.memory,
            message: s.message,
            themeId: s.theme,
          },
          user?.id,
        );
        setLastSavedAt(savedDate);
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, 30000);

    return () => clearInterval(saveTimer);
  }, [s.name1, s.name2, s.date, s.duration, s.memory, s.message, s.theme, user?.id]);

  // Auto-resume publish after OAuth redirect
  useEffect(() => {
    if (typeof window === "undefined") return;

    async function restorePending() {
      const params = new URLSearchParams(window.location.search);
      const autoPublish = params.get("autoPublish") === "true";
      const pendingAction = await getPendingPublishAction();
      const pending = pendingAction?.input ?? getPendingPublish();

      if (!isLoading && (autoPublish || pending) && isAuthenticated && user) {
        console.log("[Publish] PENDING_PUBLISH_RESTORED", {
          hasPendingInput: !!pending,
          autoPublish,
        });

        if (pending) {
          if (pending.name1) s.setField("name1", pending.name1);
          if (pending.name2) s.setField("name2", pending.name2);
          if (pending.date) s.setField("date", pending.date);
          if (pending.duration) s.setField("duration", pending.duration);
          if (pending.memory) s.setField("memory", pending.memory);
          if (pending.message) s.setField("message", pending.message);
          if (pending.themeId) s.setTheme(pending.themeId);
          if (pending.photos && pending.photos.length > 0 && s.photos.length === 0) {
            s.addPhotos(pending.photos);
          }
          if (pending.music && !s.music) s.setMusic(pending.music);
          if (pending.video && !s.video) s.setVideo(pending.video);
        }
        s.setStep(3); // Jump to Step 4 ("The Moment")

        if (autoPublish) {
          console.log("[Publish] PUBLISH_RESUMED — opening publish modal");
          // Strip autoPublish from URL so refresh doesn't auto-open modal again
          const url = new URL(window.location.href);
          url.searchParams.delete("autoPublish");
          window.history.replaceState({}, "", url.toString());

          // Auto-open publish modal
          setPublishOpen(true);
        }
      }
    }

    void restorePending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated, user]);



  useEffect(() => {
    // Lenis smooth scroll
    let lenis: { destroy: () => void } | null = null;
    let raf = 0;
    (async () => {
      const { default: Lenis } = await import("lenis");
      const inst = new Lenis({ duration: 1.1, smoothWheel: true });
      lenis = inst;
      const tick = (t: number) => {
        inst.raf(t);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    })();

    // Resume banner
    if (s.name1 || s.name2) {
      setShowResume(true);
      const to = setTimeout(() => setShowResume(false), 8000);
      return () => {
        clearTimeout(to);
        cancelAnimationFrame(raf);
        lenis?.destroy();
      };
    }
    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative min-h-screen pb-32">
      <BackgroundFX />

      {/* Top bar */}
      <div className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-charcoal/50 border-b border-ivory/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo className="h-8 md:h-10" />
          </Link>
          <StepNav />
          <div className="flex items-center gap-3">
            <AutoSaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
            <button
              onClick={() => {
                if (confirm("Start fresh? Your current story will be cleared.")) s.reset();
              }}
              className="label-caps text-ivory/50 hover:text-ivory transition-colors text-[10px]"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Resume banner */}
      <AnimatePresence>
        {showResume && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-[72px] inset-x-0 z-40 mx-auto max-w-2xl px-4"
          >
            <div className="glass-panel rounded-full px-6 py-3 flex items-center justify-between gap-4">
              <p className="text-ivory/80 text-sm">
                ✦ Welcome back — resume your story with{" "}
                <span className="text-gold">{s.name1 || "your love"}</span>?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResume(false)}
                  className="label-caps text-[10px] px-3 py-1 rounded-full bg-ivory text-charcoal"
                >
                  Continue
                </button>
                <button
                  onClick={() => {
                    s.reset();
                    setShowResume(false);
                  }}
                  className="label-caps text-[10px] px-3 py-1 rounded-full border border-ivory/30 text-ivory/70"
                >
                  Start Fresh
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 pt-32 px-6 md:px-12 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={s.currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {s.currentStep === 0 && <StoryStep />}
            {s.currentStep === 1 && <UploadStep />}
            {s.currentStep === 2 && <ThemeStep />}
            {s.currentStep === 3 && <GenerateStep />}
          </motion.div>
        </AnimatePresence>

        <StepFooter />
      </div>
    </div>
  );
}

/* --------------------------------- Step Nav --------------------------------- */
function StepNav() {
  const { currentStep, setStep } = useLovecraft();
  return (
    <div className="hidden md:flex items-center gap-4">
      {STEPS.map((label, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <button
            key={label}
            onClick={() => i <= currentStep && setStep(i)}
            className="flex items-center gap-2 group"
          >
            <span
              className={`w-6 h-6 rounded-full grid place-items-center border transition-all ${
                done
                  ? "bg-gold border-gold text-charcoal"
                  : active
                    ? "bg-ivory border-ivory text-charcoal"
                    : "border-ivory/20 text-ivory/40"
              }`}
            >
              {done ? <Check size={12} /> : <span className="text-[10px] font-bold">{i + 1}</span>}
            </span>
            <span
              className={`label-caps text-[10px] transition-colors ${
                active ? "text-ivory" : done ? "text-gold" : "text-ivory/40"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span className={`w-8 h-px ${done ? "bg-gold" : "bg-ivory/15"}`} />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------- Step Footer -------------------------------- */
function StepFooter() {
  const { currentStep, setStep, name1, name2, theme } = useLovecraft();
  if (currentStep >= 3) return null;
  const canNext =
    (currentStep === 0 && name1 && name2) || currentStep === 1 || (currentStep === 2 && theme);

  return (
    <div className="mt-16 flex items-center justify-between">
      <button
        onClick={() => setStep(Math.max(0, currentStep - 1))}
        disabled={currentStep === 0}
        className="flex items-center gap-2 label-caps text-ivory/60 hover:text-ivory disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ArrowLeft size={14} /> Back
      </button>
      <button
        onClick={() => canNext && setStep(currentStep + 1)}
        disabled={!canNext}
        className="disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <MagneticButton variant="gold" disabled={!canNext}>
          Continue <ArrowRight size={14} />
        </MagneticButton>
      </button>
    </div>
  );
}

/* ================================ STEP 1 ================================ */
function StoryStep() {
  const s = useLovecraft();
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <GlassCard>
        <span className="label-caps text-gold">Step 01 // The Story</span>
        <h2 className="font-display text-3xl md:text-4xl text-ivory mt-3 mb-8">
          Initialize the Narrative
        </h2>
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <Field
              label="Protagonist One"
              value={s.name1}
              onChange={(v) => s.setField("name1", v)}
              placeholder="Your name"
            />
            <Field
              label="Protagonist Two"
              value={s.name2}
              onChange={(v) => s.setField("name2", v)}
              placeholder="Their name"
            />
          </div>
          <Field
            label="The Epoch"
            type="date"
            value={s.date}
            onChange={(v) => s.setField("date", v)}
          />
          <Field
            label="The Setting"
            value={s.memory}
            onChange={(v) => s.setField("memory", v)}
            placeholder="A favourite memory or place"
          />
          <Field
            label="The Duration"
            value={s.duration}
            onChange={(v) => s.setField("duration", v)}
            placeholder="e.g. 3 years, 4 months"
          />
          <div>
            <label className="gold-underline-label">The Message</label>
            <textarea
              value={s.message}
              onChange={(e) => s.setField("message", e.target.value)}
              placeholder="Write the words only they will understand…"
              rows={6}
              className="gold-underline-input resize-none"
              style={{ minHeight: 160 }}
            />
          </div>
        </div>
      </GlassCard>

      {/* Live preview */}
      <div className="md:sticky md:top-32 h-fit">
        <GlassCard className="!p-0 overflow-hidden float-y" style={{ animationDuration: "6s" }}>
          <div
            className="p-8 md:p-12 min-h-[500px] flex flex-col justify-between"
            style={{
              background:
                "linear-gradient(135deg, rgba(45,10,10,0.6) 0%, rgba(19,19,19,0.4) 60%, rgba(212,175,55,0.15) 100%)",
            }}
          >
            <span className="label-caps text-gold">A Timeless Moment</span>
            <div>
              <h3 className="font-display text-5xl md:text-6xl leading-none gold-shimmer">
                {s.name1 || "You"}
                <br />
                <span className="italic font-light text-ivory/60 text-3xl">&</span>
                <br />
                {s.name2 || "Them"}
              </h3>
              <p className="mt-6 text-ivory/70 label-caps">{s.date || "The day forever begins"}</p>
              <p className="mt-6 font-display italic text-lg text-ivory/80 min-h-[3em]">
                {s.message
                  ? `"${s.message.split(/\s+/).slice(0, 12).join(" ")}${s.message.split(/\s+/).length > 12 ? "…" : ""}"`
                  : "Your first words will echo here."}
              </p>
            </div>
            <span className="label-caps text-ivory/40 mt-8">
              Live preview · updates as you write
            </span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="gold-underline-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="gold-underline-input"
      />
    </div>
  );
}

/* ================================ STEP 2 ================================ */
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

async function compressImage(file: File, maxW = 800): Promise<MediaFile> {
  const url = await fileToDataUrl(file);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = c.toDataURL("image/jpeg", 0.82);
      resolve({ name: file.name, dataUrl });
    };
    img.onerror = () => resolve({ name: file.name, dataUrl: url });
    img.src = url;
  });
}

function UploadStep() {
  const s = useLovecraft();
  const photoRef = useRef<HTMLInputElement>(null);
  const musicRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onPhotos = async (files: FileList | null) => {
    if (!files) return;
    setBusy(true);
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const compressed = await Promise.all(list.map((f) => compressImage(f)));
    s.addPhotos(compressed);
    setBusy(false);
  };

  const onMusic = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    s.setMusic({ name: f.name, dataUrl: await fileToDataUrl(f) });
  };

  const onVideo = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    s.setVideo({ name: f.name, dataUrl: await fileToDataUrl(f) });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <GlassCard>
        <span className="label-caps text-gold">Step 02 // Memories</span>
        <h2 className="font-display text-3xl md:text-4xl text-ivory mt-3 mb-8">
          Curate Your Canvas
        </h2>

        {/* Photos */}
        <div
          onClick={() => photoRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void onPhotos(e.dataTransfer.files);
          }}
          className="cursor-pointer border border-dashed border-gold/40 hover:border-gold/80 hover:bg-gold/5 transition-all rounded-2xl p-10 text-center"
        >
          <Upload className="mx-auto text-gold mb-3" />
          <p className="font-display italic text-lg text-ivory">Drag & drop high-res photos here</p>
          <p className="label-caps text-ivory/40 mt-2 text-[10px]">or click to browse</p>
          {s.photos.length > 0 && (
            <p className="mt-4 label-caps text-gold text-[10px]">
              {s.photos.length} photo{s.photos.length === 1 ? "" : "s"} curated
            </p>
          )}
          {busy && <p className="mt-2 text-ivory/40 text-xs">Compressing…</p>}
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => void onPhotos(e.target.files)}
          />
        </div>

        {s.photos.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {s.photos.map((p, i) => (
              <div key={i} className="relative aspect-square rounded-md overflow-hidden group">
                <img src={p.dataUrl} alt={p.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => s.removePhoto(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-charcoal/80 opacity-0 group-hover:opacity-100 grid place-items-center"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Music */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <MediaButton
            icon={<Music className="text-gold" />}
            title="Soundtrack"
            filename={s.music?.name}
            onClick={() => musicRef.current?.click()}
            onClear={() => s.setMusic(null)}
          />
          <input
            ref={musicRef}
            type="file"
            accept="audio/*"
            hidden
            onChange={(e) => void onMusic(e.target.files)}
          />
          <MediaButton
            icon={<Film className="text-gold" />}
            title="Cinematic B-Roll"
            filename={s.video?.name}
            onClick={() => videoRef.current?.click()}
            onClear={() => s.setVideo(null)}
          />
          <input
            ref={videoRef}
            type="file"
            accept="video/*"
            hidden
            onChange={(e) => void onVideo(e.target.files)}
          />
        </div>
      </GlassCard>

      <GlassCard>
        <span className="label-caps text-gold">Preview</span>
        <h2 className="font-display text-3xl md:text-4xl text-ivory mt-3 mb-8">
          Every fragment matters
        </h2>
        <p className="text-ivory/60 leading-relaxed mb-6">
          High-resolution photos will be automatically optimised. Music will fade in as your love
          story opens. Video plays inside a cinematic scene near the finale.
        </p>
        <div className="space-y-3 text-sm">
          <Row label="Photos" value={`${s.photos.length} curated`} />
          <Row label="Soundtrack" value={s.music?.name ?? "None"} />
          <Row label="B-Roll" value={s.video?.name ?? "None"} />
        </div>
      </GlassCard>
    </div>
  );
}

function MediaButton({
  icon,
  title,
  filename,
  onClick,
  onClear,
}: {
  icon: React.ReactNode;
  title: string;
  filename?: string;
  onClick: () => void;
  onClear: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative border border-gold/30 hover:border-gold/70 hover:bg-gold/5 rounded-xl p-4 text-left transition-all"
    >
      <div className="flex items-center gap-3">
        {icon}
        <div className="min-w-0">
          <p className="label-caps text-ivory/80 text-[10px]">{title}</p>
          <p className="text-sm text-ivory truncate">{filename ?? "Choose file"}</p>
        </div>
      </div>
      {filename && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-ivory/10 hover:bg-ivory/20 grid place-items-center"
        >
          <X size={10} />
        </span>
      )}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-ivory/10 py-2">
      <span className="label-caps text-ivory/50 text-[10px]">{label}</span>
      <span className="text-ivory/80 truncate max-w-[60%]">{value}</span>
    </div>
  );
}

/* ================================ STEP 3 ================================ */
function ThemeStep() {
  const { setTheme, setStep } = useLovecraft();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<CategorySortOption>("featured");
  const [showUnpublished, setShowUnpublished] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem("lovecraft_favorite_templates");
      return saved ? new Set(JSON.parse(saved)) : new Set(["cosmic", "proposal"]);
    } catch {
      return new Set(["cosmic", "proposal"]);
    }
  });

  const [previewTemplate, setPreviewTemplate] = useState<TemplateSpec | null>(null);
  const [compareList, setCompareList] = useState<TemplateSpec[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (typeof window !== "undefined") {
        localStorage.setItem("lovecraft_favorite_templates", JSON.stringify(Array.from(next)));
      }
      return next;
    });
  };

  const handleUseTemplate = (t: TemplateSpec) => {
    // SECURITY GUARD: Ensure template is published OR user is admin
    if (!categoryService.canUserUseTemplate(t.id, user?.role)) {
      toast.error("This template is under development and not available to the public yet.");
      return;
    }

    setTheme(t.id);
    setPreviewTemplate(null);
    setShowCompareModal(false);
    setStep(3); // Enter Builder / Generation Step
  };

  // Filter templates dynamically via category service with strict status rules
  const activeCategorySpec = getCategoryBySlug(selectedCategory);
  const filteredTemplates = categoryService.filterTemplates(
    selectedCategory,
    searchQuery,
    onlyFavorites,
    favorites,
    sortBy,
    isAdmin && showUnpublished // Only admins can opt to include unpublished templates
  );

  return (
    <div className="pb-10">
      {/* Admin Mode Toggle Banner (Only visible to authenticated Admins) */}
      {isAdmin && (
        <div className="max-w-7xl mx-auto mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500 text-charcoal font-bold text-[10px] label-caps">
              Admin Mode
            </span>
            <span className="text-amber-200 text-xs font-medium">
              Toggle visibility to preview and test in-development templates
            </span>
          </div>
          <button
            onClick={() => setShowUnpublished(!showUnpublished)}
            className={`px-3 py-1 rounded-xl text-xs label-caps transition-all font-bold ${
              showUnpublished
                ? "bg-amber-500 text-charcoal shadow-md"
                : "bg-ivory/10 text-ivory/70 hover:text-ivory"
            }`}
          >
            {showUnpublished ? "Showing All (Incl. Drafts)" : "Showing Published Only"}
          </button>
        </div>
      )}

      {/* ── Category Navigation Bar ────────────────────────────────────────── */}
      <div className="mb-6">
        <CategoryNavigation
          categories={CATEGORY_LIST}
          activeCategoryId={selectedCategory}
          onSelectCategory={(id) => setSelectedCategory(id)}
        />
      </div>


      {/* ── Category Hero Header & Controls ────────────────────────────────── */}
      <CategoryHeader
        category={activeCategorySpec}
        templateCount={filteredTemplates.length}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        onlyFavorites={onlyFavorites}
        onToggleOnlyFavorites={() => setOnlyFavorites(!onlyFavorites)}
        favoritesCount={favorites.size}
        sortBy={sortBy}
        onSortChange={(sort) => setSortBy(sort)}
        compareCount={compareList.length}
        onOpenCompare={() => setShowCompareModal(true)}
      />


      {/* ── Responsive Templates Grid ───────────────────────────────────────────── */}
      {filteredTemplates.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-display text-2xl text-ivory/60">No templates found</p>
          <p className="text-ivory/40 text-xs mt-1">Try resetting search filters or category chips.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {filteredTemplates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              isFavorite={favorites.has(t.id)}
              onToggleFavorite={toggleFavorite}
              onView={(tmpl) => setPreviewTemplate(tmpl)}
              onUse={handleUseTemplate}
            />
          ))}
        </div>
      )}

      {/* ── Lazy-Loaded Modals Wrapped in Suspense ─────────────────────────────── */}
      <Suspense fallback={null}>
        <TemplatePreviewModal
          template={previewTemplate}
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUseTemplate={handleUseTemplate}
        />

        <CompareTemplatesModal
          t1={compareList[0] || null}
          t2={compareList[1] || null}
          isOpen={showCompareModal}
          onClose={() => setShowCompareModal(false)}
          onSelectTemplate={handleUseTemplate}
        />
      </Suspense>
    </div>
  );
}

/* ================================ STEP 4 ================================ */
function GenerateStep() {
  const s = useLovecraft();
  const t = THEMES[s.theme] ?? THEMES.cosmic;
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("");
  const [downloaded, setDownloaded] = useState(false);
  const [confetti, setConfetti] = useState<number[]>([]);
  // Publish & Preview modal states
  const [publishOpen, setPublishOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const handleOpenPreview = async () => {
    setIsPreviewLoading(true);
    try {
      const engine = new GenerationEngine();
      const blueprint = await engine.generateBlueprint({
        name1: s.name1,
        name2: s.name2,
        message: s.message,
        date: s.date,
        duration: s.duration,
        memory: s.memory,
        photos: s.photos,
        music: s.music,
        video: s.video,
        themeId: s.theme,
      });
      const html = renderBlueprint(blueprint);
      setPreviewHtml(html);
      setPreviewOpen(true);
    } catch (err) {
      toast.error("Failed to generate preview");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Auto-open publish modal when returning from OAuth with pending publish payload
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const autoPublish = params.get("autoPublish") === "true";
    const pending = getPendingPublish();

    if ((autoPublish || pending) && isAuthenticated && user) {
      console.log("[LoveCraft Step4] Auto-opening publish modal for authenticated user");
      setPublishOpen(true);

      if (autoPublish) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const phrases = [
    "✨ Analyzing your memories...",
    "✨ Designing layout architecture...",
    "✨ Weaving the story...",
    "✨ Optimizing media assets...",
    "✨ Publishing masterpiece...",
  ];

  // ── Download flow (existing, unchanged) ──────────────────────
  const generate = async () => {
    s.setGenerating(true);
    setProgress(0);

    // Start generating the blueprint in the background
    const engine = new GenerationEngine();
    const blueprintPromise = engine.generateBlueprint({
      name1: s.name1,
      name2: s.name2,
      message: s.message,
      date: s.date,
      duration: s.duration,
      memory: s.memory,
      photos: s.photos,
      music: s.music,
      video: s.video,
      themeId: s.theme,
    });

    for (let i = 0; i < phrases.length; i++) {
      setPhase(phrases[i]);
      setProgress(Math.round(((i + 1) / phrases.length) * 100));
      await new Promise((r) => setTimeout(r, 800));
    }

    const blueprint = await blueprintPromise;
    const html = renderBlueprint(blueprint);
    const zip = new JSZip();
    zip.file("index.html", html);
    zip.file(
      "README.md",
      buildReadme({
        name1: s.name1,
        name2: s.name2,
        message: s.message,
        date: s.date,
        duration: s.duration,
        memory: s.memory,
        photos: s.photos,
        music: s.music,
        video: s.video,
        themeId: s.theme,
      }),
    );
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const slug =
      `${s.name1}-${s.name2}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "love-story";
    a.download = `lovecraft-${slug}.zip`;
    a.click();
    URL.revokeObjectURL(url);

    s.setGenerating(false);
    s.setComplete(true);
    setDownloaded(true);
    setConfetti(Array.from({ length: 60 }, (_, i) => i));
  };

  const share = () => {
    const msg = `I made something for you ❤️ Open the file — it's our story, as a cinematic experience. Made with LoveCraft AI`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // ── Publish input (passed to PublishModal) ────────────────────
  const publishInput = {
    name1: s.name1,
    name2: s.name2,
    date: s.date,
    duration: s.duration,
    memory: s.memory,
    message: s.message,
    themeId: s.theme,
    photos: s.photos,
    music: s.music,
    video: s.video,
  };

  // ── Success screen (after download) ─────────────────────────
  if (s.isComplete && downloaded) {
    return (
      <div className="text-center py-20 relative">
        {confetti.map((i) => {
          const colors = ["#d4af37", "#f8b6b2", "#a67b7b", "#faf9f6"];
          return (
            <span
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}vw`,
                background: colors[i % colors.length],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          );
        })}
        <Sparkles className="text-gold mx-auto mb-4" size={48} />
        <h2 className="font-display text-5xl md:text-7xl text-ivory">
          Your Love Story <span className="italic gold-shimmer">Is Ready</span>
        </h2>
        <p className="mt-6 text-ivory/60">
          Your download has started. Want a permanent online link? Publish it live.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          {/* Publish Live — new */}
          <button onClick={() => setPublishOpen(true)}>
            <MagneticButton variant="gold">
              <Globe size={14} /> Publish Live ✨
            </MagneticButton>
          </button>
          {/* Share on WhatsApp — unchanged */}
          <button onClick={share}>
            <MagneticButton variant="ghost">
              <Share2 size={14} /> Share on WhatsApp
            </MagneticButton>
          </button>
          {/* Dashboard — new */}
          <Link to="/dashboard">
            <MagneticButton variant="ghost">
              <LayoutDashboard size={14} /> My Sites
            </MagneticButton>
          </Link>
          <button
            onClick={() => {
              s.reset();
            }}
          >
            <MagneticButton variant="ghost">Create Another</MagneticButton>
          </button>
        </div>

        {/* Publish Modal Wrapped in Suspense */}
        <Suspense fallback={null}>
          <PublishModal
            isOpen={publishOpen}
            onClose={() => setPublishOpen(false)}
            input={publishInput}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto text-center">
      <span className="label-caps text-gold">Step 04 — Final Review</span>
      <h2 className="font-display text-5xl md:text-7xl text-ivory mt-4">
        The <span className="italic gold-shimmer">Moment</span>
      </h2>
      <p className="mt-4 text-ivory/60 max-w-xl mx-auto">
        Your narrative is woven. Review below before we bring this memory to life.
      </p>

      <GlassCard className="mt-12 !p-0 overflow-hidden text-left border border-ivory/10 shadow-2xl relative">
        <div className="grid md:grid-cols-2">
          {/* Enhanced Creative Studio preview card */}
          <div
            className="min-h-[340px] p-8 flex flex-col justify-between relative overflow-hidden group"
            style={{
              background: `linear-gradient(135deg, ${t.bg || '#050505'}, ${t.c2 || '#1a0535'} 70%, ${t.c1 || '#c060a0'})`,
            }}
          >
            {/* Ambient glowing radial overlay */}
            <div
              className="absolute -top-24 -left-24 w-64 h-64 rounded-full blur-3xl opacity-40 pointer-events-none"
              style={{ background: t.c1 || "#c9a96e" }}
            />
            <div
              className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ background: t.c2 || "#7030d0" }}
            />

            <div className="flex items-center justify-between relative z-10">
              <span className="label-caps text-ivory/90 tracking-widest text-[11px] bg-charcoal/40 backdrop-blur px-3 py-1 rounded-full border border-ivory/10">
                Creative Studio
              </span>
              <button
                onClick={handleOpenPreview}
                disabled={isPreviewLoading}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 hover:bg-gold/30 border border-gold/40 text-gold text-xs font-medium transition-all shadow-lg backdrop-blur"
              >
                <Eye size={13} /> {isPreviewLoading ? "Loading…" : "Preview Story"}
              </button>
            </div>

            <div className="relative z-10 mt-12">
              <p className="font-display text-4xl text-ivory drop-shadow-md">{t.name}</p>
              <p className="label-caps text-gold/90 mt-1.5 text-[11px] font-mono tracking-wider">
                {t.vibe}
              </p>
            </div>
          </div>

          <div className="p-8 space-y-2 bg-charcoal/40 backdrop-blur">
            <SummaryRow label="The Protagonists" value={`${s.name1 || "—"} & ${s.name2 || "—"}`} />
            <SummaryRow label="The Epoch" value={s.date || "Undated"} />
            <SummaryRow label="Atmosphere" value={t.atmosphere} multiline />
            <SummaryRow label="Memories" value={`${s.photos.length} photos`} />
            <SummaryRow label="Soundtrack" value={s.music?.name ?? "None"} />
            <SummaryRow label="B-Roll" value={s.video?.name ?? "None"} />
          </div>
        </div>
      </GlassCard>

      {/* Action buttons: Download (existing) + Publish Live (new) */}
      <div className="mt-10">
        {!s.isGenerating ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
            {/* ── Download ZIP ── */}
            <button onClick={generate} className="flex-1">
              <MagneticButton variant="primary" className="w-full text-base py-5">
                <Download size={16} /> Download ZIP
              </MagneticButton>
            </button>
            {/* ── Publish Live ── */}
            <button onClick={() => setPublishOpen(true)} className="flex-1">
              <MagneticButton variant="gold" className="w-full text-base py-5">
                <Globe size={16} /> Publish Live ✨
              </MagneticButton>
            </button>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="relative mx-auto w-24 h-24 mb-6">
              <span className="absolute inset-0 rounded-full border-2 border-gold/40 animate-ping" />
              <span
                className="absolute inset-2 rounded-full border-2 border-gold/60 animate-ping"
                style={{ animationDelay: "0.3s" }}
              />
              <span className="absolute inset-4 rounded-full bg-gold/20 backdrop-blur grid place-items-center">
                <Sparkles className="text-gold" />
              </span>
            </div>
            <p className="font-display italic text-xl text-ivory">{phase}</p>
            <div className="mt-4 h-1 rounded-full bg-ivory/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold to-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Live Preview Modal */}
      <AnimatePresence>
        {previewOpen && previewHtml && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-charcoal/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-5xl h-[85vh] bg-charcoal border border-ivory/20 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative"
            >
              <div className="p-4 border-b border-ivory/10 flex items-center justify-between bg-charcoal/80">
                <div className="flex items-center gap-2">
                  <Eye className="text-gold" size={18} />
                  <span className="font-display text-lg text-ivory">
                    Live Preview — {s.name1 || "Story"} & {s.name2 || "Story"}
                  </span>
                </div>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="w-8 h-8 rounded-full grid place-items-center text-ivory/50 hover:text-ivory hover:bg-ivory/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <iframe
                title="Story Preview"
                srcDoc={previewHtml}
                className="w-full h-full border-0 bg-black"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Publish Modal */}
      <Suspense fallback={null}>
        <PublishModal
          isOpen={publishOpen}
          onClose={() => setPublishOpen(false)}
          input={publishInput}
        />
      </Suspense>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ivory/20 py-3 last:border-0">
      <span className="label-caps text-ivory/90 text-[10px] shrink-0 pt-1">{label}</span>
      <span
        className={`text-ivory font-medium text-right ${multiline ? "" : "truncate max-w-[60%]"}`}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}
