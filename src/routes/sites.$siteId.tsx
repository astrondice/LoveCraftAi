// ─────────────────────────────────────────────────────────────────
// /sites/$siteId — Public site viewer
// Renders a published love story site in a sandboxed iframe
// ─────────────────────────────────────────────────────────────────
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { Heart, ExternalLink } from "lucide-react";
import { publishService } from "@/services/publish.service";
import { analyticsService } from "@/services/analytics.service";
import type { PublishedSite } from "@/types";

export const Route = createFileRoute("/sites/$siteId")({
  head: () => ({
    meta: [
      { title: "A Love Story — LoveCraft AI" },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: SiteViewerPage,
});

function SiteViewerPage() {
  const { siteId } = Route.useParams();
  const [site, setSite] = useState<PublishedSite | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const result = await publishService.getSite(siteId);
        if (cancelled) return;

        if (!result) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setSite(result.site);
        setHtml(result.html);
        setLoading(false);

        // Track view (fire-and-forget)
        void publishService.trackView(siteId);
        void analyticsService.track({
          site_id: siteId,
          event_type: "view",
          referrer: document.referrer,
        });
      } catch {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [siteId]);

  // ── Loading screen ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            <span className="absolute inset-0 rounded-full border-2 border-gold/30 animate-ping" />
            <span
              className="absolute inset-2 rounded-full border-2 border-gold/50 animate-ping"
              style={{ animationDelay: "0.3s" }}
            />
            <span className="absolute inset-4 rounded-full bg-gold/10 grid place-items-center">
              <Heart className="text-gold" size={18} />
            </span>
          </div>
          <p className="font-display italic text-xl text-ivory">
            Opening your love story…
          </p>
        </motion.div>
      </div>
    );
  }

  // ── 404 ────────────────────────────────────────────────────────
  if (notFound || !html) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="font-display text-8xl text-ivory/10 mb-4">404</p>
          <h1 className="font-display text-3xl text-ivory mb-3">
            This memory doesn't exist
          </h1>
          <p className="text-ivory/50 mb-8">
            The love story you're looking for may have been removed or made private.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-gold text-charcoal px-6 py-3 label-caps text-[11px]"
          >
            Create Your Own
          </Link>
        </div>
      </div>
    );
  }

  // ── Site viewer ─────────────────────────────────────────────────
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Full-screen iframe with the generated HTML */}
      <AnimatePresence>
        <motion.iframe
          key={siteId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          srcDoc={html}
          title={site?.title ?? "Love Story"}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
          // SEO / security
          referrerPolicy="no-referrer"
        />
      </AnimatePresence>

      {/* Watermark badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-charcoal/80 backdrop-blur border border-ivory/10 text-ivory/60 hover:text-ivory hover:border-ivory/30 transition-all text-[11px] font-semibold tracking-widest uppercase"
        >
          <Logo className="h-4" />
          <ExternalLink size={10} className="ml-1 opacity-50" />
        </a>
      </motion.div>
    </div>
  );
}
