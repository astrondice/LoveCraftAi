// ─────────────────────────────────────────────────────────────────
// Promotional Showcase — Master Browser Device Mockup Component
// Renders active Raksha Bandhan / Love / Global campaigns (video & image).
// ─────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { promoVideoService } from "@/services/promo-video.service";
import type { PromotionalVideo, PromoEventType } from "@/types/promo-video.types";
import { Volume2, VolumeX, Sparkles, ArrowRight, Heart } from "lucide-react";

interface PromotionalShowcaseProps {
  category?: string;
  className?: string;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
}

export function PromotionalShowcase({
  category = "global",
  className = "",
  fallbackTitle = "Aarav & Meera",
  fallbackSubtitle = "Two Souls, One Journey",
}: PromotionalShowcaseProps) {
  const [videos, setVideos] = useState<PromotionalVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackedEventsRef = useRef<Set<PromoEventType>>(new Set());

  // 1. Fetch active promotional assets on mount or category change
  useEffect(() => {
    let isCancelled = false;

    const fetchVideos = async () => {
      setLoading(true);
      setHasError(false);
      try {
        const activeList = await promoVideoService.getActiveVideos(category);
        if (!isCancelled) {
          setVideos(activeList);
          setCurrentIndex(0);
          setLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.warn("[PromotionalShowcase] Fetch failed, using static preview fallback", err);
          setHasError(true);
          setLoading(false);
        }
      }
    };

    void fetchVideos();

    return () => {
      isCancelled = true;
    };
  }, [category]);

  const activeAsset: PromotionalVideo | undefined = videos[currentIndex];

  // Track impression whenever current asset changes
  useEffect(() => {
    trackedEventsRef.current = new Set();
    if (activeAsset) {
      void promoVideoService.trackEvent({
        video_id: activeAsset.id,
        event_type: "impression",
        category,
      });
    }
  }, [activeAsset?.id, category]);

  // 2. IntersectionObserver: pause video when scrolled off-screen
  useEffect(() => {
    if (!containerRef.current || !activeAsset) return;

    const el = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          if (activeAsset.media_type === "video" && videoRef.current) {
            videoRef.current
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => setIsPlaying(false));
          } else {
            setIsPlaying(true);
          }
        } else {
          if (videoRef.current) {
            videoRef.current.pause();
          }
          setIsPlaying(false);
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [activeAsset]);

  // 3. Campaign Rotation (8 seconds duration for image/video slides)
  useEffect(() => {
    if (videos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [videos.length]);

  // Handle video progress for analytics
  const handleTimeUpdate = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
    const vid = e.currentTarget;
    if (!vid.duration || !activeAsset) return;

    const pct = (vid.currentTime / vid.duration) * 100;
    const tracked = trackedEventsRef.current;

    if (pct >= 25 && !tracked.has("25%")) {
      tracked.add("25%");
      void promoVideoService.trackEvent({ video_id: activeAsset.id, event_type: "25%", category });
    }
    if (pct >= 50 && !tracked.has("50%")) {
      tracked.add("50%");
      void promoVideoService.trackEvent({ video_id: activeAsset.id, event_type: "50%", category });
    }
    if (pct >= 75 && !tracked.has("75%")) {
      tracked.add("75%");
      void promoVideoService.trackEvent({ video_id: activeAsset.id, event_type: "75%", category });
    }
  };

  const handleEnded = () => {
    if (activeAsset) {
      void promoVideoService.trackEvent({ video_id: activeAsset.id, event_type: "complete", category });
    }
    if (videos.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    if (activeAsset && !trackedEventsRef.current.has("play")) {
      trackedEventsRef.current.add("play");
      void promoVideoService.trackEvent({ video_id: activeAsset.id, event_type: "play", category });
    }
  };

  const handleCtaClick = () => {
    if (activeAsset) {
      void promoVideoService.trackEvent({ video_id: activeAsset.id, event_type: "cta_click", category });
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const showPromotionalContent = !loading && !hasError && activeAsset && (activeAsset.video_url || activeAsset.poster_url);

  // Determine badge text based on asset category
  const getBadgeText = (cat?: string) => {
    if (cat === "raksha-bandhan") return "RAKSHA BANDHAN 2026";
    if (cat === "love") return "LOVE CRAFT SPOTLIGHT";
    return "FEATURED EXPERIENCE";
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[9/16] md:aspect-[4/5] max-h-[700px] glass-panel rounded-[2rem] overflow-hidden shadow-2xl mx-auto md:ml-auto md:mr-0 border border-ivory/10 ${className}`}
    >
      {/* Browser Chrome Header */}
      <div className="absolute top-0 inset-x-0 h-12 bg-charcoal/85 backdrop-blur-xl border-b border-ivory/10 flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <div className="text-[10px] label-caps text-ivory/50 flex items-center gap-1.5 truncate max-w-[200px] md:max-w-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse shrink-0" />
          <span className="truncate">
            {showPromotionalContent
              ? `lovecraft.ai/spotlight/${activeAsset?.category}/${activeAsset?.id.slice(0, 8)}`
              : "lovecraft.ai/u/aarav-meera"}
          </span>
        </div>
        <div className="w-8 flex justify-end">
          {showPromotionalContent && activeAsset?.media_type === "video" && (
            <button
              onClick={toggleMute}
              className="text-ivory/60 hover:text-ivory transition-colors p-1"
              title={isMuted ? "Unmute sound" : "Mute sound"}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-gold" />}
            </button>
          )}
        </div>
      </div>

      {/* Viewport Screen */}
      <div className="absolute inset-0 pt-12 overflow-hidden bg-charcoal">
        {showPromotionalContent ? (
          /* Promotional Campaign Media Viewport */
          <AnimatePresence mode="wait">
            <motion.div
              key={activeAsset.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="relative w-full h-full"
            >
              {/* Campaign Category Badge */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-charcoal/80 backdrop-blur-md border border-gold/40 text-gold label-caps text-[9px] font-bold shadow-lg">
                <Sparkles size={11} className="animate-spin-slow" />
                <span>{getBadgeText(activeAsset.category)}</span>
              </div>

              {/* Multi-asset Rotation Dots */}
              {videos.length > 1 && (
                <div className="absolute top-4 right-4 z-20 flex gap-1">
                  {videos.map((v, i) => (
                    <button
                      key={v.id}
                      onClick={() => setCurrentIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === currentIndex ? "w-5 bg-gold" : "w-1.5 bg-ivory/30"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Render Video or Image Asset */}
              {activeAsset.media_type === "video" || activeAsset.video_url.includes("/videos/") || activeAsset.video_url.match(/\.(mp4|webm|mov|m4v)/i) ? (
                <video
                  ref={videoRef}
                  src={activeAsset.video_url}
                  poster={activeAsset.poster_url || undefined}
                  autoPlay={activeAsset.autoplay ?? true}
                  muted={isMuted}
                  loop={activeAsset.loop ?? true}
                  playsInline
                  preload="metadata"
                  onPlay={handlePlay}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleEnded}
                  onError={() => setHasError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                /* High-Res Cinematic Image Showcase */
                <motion.div
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 8, ease: "linear" }}
                  className="relative w-full h-full"
                >
                  <img
                    src={activeAsset.video_url || activeAsset.poster_url || ""}
                    alt={activeAsset.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </motion.div>
              )}

              {/* Cinematic Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent pointer-events-none" />

              {/* Overlay Content & Typography */}
              <div className="absolute bottom-6 inset-x-6 z-20 flex flex-col items-start space-y-3">
                {activeAsset.title && (
                  <div className="space-y-1">
                    <h3 className="font-display text-3xl md:text-4xl text-ivory tracking-tight drop-shadow-lg leading-tight">
                      {activeAsset.title}
                    </h3>
                    {activeAsset.subtitle && (
                      <p className="text-gold text-xs font-semibold tracking-[0.15em] uppercase drop-shadow">
                        {activeAsset.subtitle}
                      </p>
                    )}
                    {activeAsset.description && (
                      <p className="text-ivory/80 text-xs md:text-sm font-light line-clamp-2 pt-1 leading-relaxed drop-shadow">
                        {activeAsset.description}
                      </p>
                    )}
                  </div>
                )}

                {activeAsset.cta_url && (
                  <a
                    href={activeAsset.cta_url}
                    onClick={handleCtaClick}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold hover:bg-gold-light text-charcoal font-bold text-xs label-caps shadow-xl hover:shadow-gold/20 transition-all hover:scale-105 mt-2"
                  >
                    <span>{activeAsset.cta_text || "Explore Experience"}</span>
                    <ArrowRight size={14} />
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          /* Fallback: Static Website Preview Frame (Rule 15 Fallback) */
          <div className="relative w-full h-full overflow-hidden bg-[#1a1a1a]">
            {/* Hero Image */}
            <div className="relative h-[50%] w-full">
              <img
                src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop"
                alt="Wedding memory"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />

              {/* Title overlay */}
              <div className="absolute bottom-6 inset-x-0 text-center">
                <h2 className="font-display text-4xl text-ivory tracking-wider mb-2">
                  {fallbackTitle}
                </h2>
                <p className="text-gold text-xs tracking-[0.2em] uppercase">
                  {fallbackSubtitle}
                </p>
              </div>
            </div>

            {/* Content Timeline */}
            <div className="px-6 py-8 space-y-8">
              <div className="space-y-3">
                <div className="w-16 h-px bg-gold/50 mx-auto" />
                <p className="text-center text-ivory/70 text-sm font-light italic leading-relaxed">
                  "From our first coffee in Mumbai to saying 'I do' under the stars in Tuscany."
                </p>
              </div>

              {/* Photo Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="aspect-square rounded-lg overflow-hidden border border-ivory/10">
                  <img
                    src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=400&auto=format&fit=crop"
                    alt="Memory photo 1"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="aspect-square rounded-lg overflow-hidden border border-ivory/10">
                  <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop"
                    alt="Memory photo 2"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            {/* Mini Music Player UI */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl glass-panel border border-ivory/10 flex items-center gap-4 backdrop-blur-md bg-charcoal/60 z-20 shadow-xl">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                <div className="w-3 h-3 border-y-[6px] border-y-transparent border-l-[8px] border-l-gold translate-x-0.5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-xs font-medium text-ivory truncate">
                  Can't Help Falling in Love
                </div>
                <div className="text-[10px] text-ivory/50">Kinna Sona (Acoustic)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
