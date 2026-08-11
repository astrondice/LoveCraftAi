// ─────────────────────────────────────────────────────────────────
// Promotional Showcase — Premium Browser Device Mockup Component
// Renders active admin promotional videos or falls back to static preview.
// ─────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { promoVideoService } from "@/services/promo-video.service";
import type { PromotionalVideo, PromoEventType } from "@/types/promo-video.types";
import { Volume2, VolumeX, Sparkles, ArrowRight, Play, Globe } from "lucide-react";

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

  // 1. Fetch active promo videos on mount / category change
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
          console.warn("[PromotionalShowcase] Fetch failed, fallback to static preview", err);
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

  const activeVideo: PromotionalVideo | undefined = videos[currentIndex];

  // Reset tracked quartile events whenever active video changes
  useEffect(() => {
    trackedEventsRef.current = new Set();
    if (activeVideo) {
      void promoVideoService.trackEvent({
        video_id: activeVideo.id,
        event_type: "impression",
        category,
      });
    }
  }, [activeVideo?.id, category]);

  // 2. IntersectionObserver: pause video when off-screen, play when in-screen
  useEffect(() => {
    if (!containerRef.current || !videoRef.current || !activeVideo) return;

    const el = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          videoRef.current
            ?.play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [activeVideo]);

  // 3. Auto-rotation timer if multiple videos are configured
  useEffect(() => {
    if (videos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, 9000); // 9 seconds rotation

    return () => clearInterval(interval);
  }, [videos.length]);

  // Handle video progress for 25%, 50%, 75%, complete analytics
  const handleTimeUpdate = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
    const vid = e.currentTarget;
    if (!vid.duration || !activeVideo) return;

    const pct = (vid.currentTime / vid.duration) * 100;
    const tracked = trackedEventsRef.current;

    if (pct >= 25 && !tracked.has("25%")) {
      tracked.add("25%");
      void promoVideoService.trackEvent({
        video_id: activeVideo.id,
        event_type: "25%",
        category,
      });
    }
    if (pct >= 50 && !tracked.has("50%")) {
      tracked.add("50%");
      void promoVideoService.trackEvent({
        video_id: activeVideo.id,
        event_type: "50%",
        category,
      });
    }
    if (pct >= 75 && !tracked.has("75%")) {
      tracked.add("75%");
      void promoVideoService.trackEvent({
        video_id: activeVideo.id,
        event_type: "75%",
        category,
      });
    }
  };

  const handleEnded = () => {
    if (activeVideo) {
      void promoVideoService.trackEvent({
        video_id: activeVideo.id,
        event_type: "complete",
        category,
      });
    }

    // Auto rotate to next video if multiple videos exist
    if (videos.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    if (activeVideo && !trackedEventsRef.current.has("play")) {
      trackedEventsRef.current.add("play");
      void promoVideoService.trackEvent({
        video_id: activeVideo.id,
        event_type: "play",
        category,
      });
    }
  };

  const handleCtaClick = () => {
    if (activeVideo) {
      void promoVideoService.trackEvent({
        video_id: activeVideo.id,
        event_type: "cta_click",
        category,
      });
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  // Check if we should render promo video or fall back to static preview
  const showVideo = !loading && !hasError && activeVideo && activeVideo.video_url;

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[9/16] md:aspect-[4/5] max-h-[700px] glass-panel rounded-[2rem] overflow-hidden shadow-2xl mx-auto md:ml-auto md:mr-0 border border-ivory/10 ${className}`}
    >
      {/* Fake Browser Header */}
      <div className="absolute top-0 inset-x-0 h-12 bg-charcoal/85 backdrop-blur-xl border-b border-ivory/10 flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <div className="text-[10px] label-caps text-ivory/50 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          {showVideo
            ? `lovecraft.ai/spotlight/${activeVideo?.category}`
            : "lovecraft.ai/u/aarav-meera"}
        </div>
        <div className="w-8 flex justify-end">
          {showVideo && (
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

      {/* Viewport Content */}
      <div className="absolute inset-0 pt-12 overflow-hidden bg-charcoal">
        {showVideo ? (
          /* Dynamic Promotional Video Experience */
          <AnimatePresence mode="wait">
            <motion.div
              key={activeVideo.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="relative w-full h-full"
            >
              {/* Premium Spotlight Badge */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-charcoal/70 backdrop-blur-md border border-gold/40 text-gold label-caps text-[9px] font-bold shadow-lg">
                <Sparkles size={11} className="animate-spin-slow" />
                <span>LoveCraft Spotlight</span>
              </div>

              {/* Multiple Video Counter Indicator */}
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

              {/* Video Element */}
              <video
                ref={videoRef}
                src={activeVideo.video_url}
                poster={activeVideo.poster_url || undefined}
                autoPlay={activeVideo.autoplay}
                muted={isMuted}
                loop={activeVideo.loop}
                playsInline
                preload="metadata"
                onPlay={handlePlay}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onError={() => setHasError(true)}
                className="w-full h-full object-cover"
              />

              {/* Vignette Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/10 to-transparent pointer-events-none" />

              {/* Video Info & CTA Overlay */}
              <div className="absolute bottom-6 inset-x-6 z-20 flex flex-col items-start gap-3">
                {activeVideo.title && (
                  <div>
                    <h3 className="font-display text-2xl md:text-3xl text-ivory drop-shadow-md">
                      {activeVideo.title}
                    </h3>
                    {activeVideo.description && (
                      <p className="text-ivory/80 text-xs md:text-sm font-light line-clamp-2 mt-1 drop-shadow">
                        {activeVideo.description}
                      </p>
                    )}
                  </div>
                )}

                {activeVideo.cta_url && (
                  <a
                    href={activeVideo.cta_url}
                    onClick={handleCtaClick}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold hover:bg-gold-light text-charcoal font-bold text-xs label-caps shadow-xl hover:shadow-gold/20 transition-all hover:scale-105"
                  >
                    <span>{activeVideo.cta_text || "Explore Experience"}</span>
                    <ArrowRight size={13} />
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          /* Fallback: Static Website Preview Frame (Rule 16 Fallback) */
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
