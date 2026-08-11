// ─────────────────────────────────────────────────────────────────
// /sites/$siteId — Public site viewer
// Renders a published love story site in a sandboxed iframe.
// Dynamic SSR head: title, description, og:image, canonical,
// and robots are resolved from the actual site record.
// ─────────────────────────────────────────────────────────────────
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { Heart, ExternalLink } from "lucide-react";
import { publishService } from "@/services/publish.service";
import { analyticsService } from "@/services/analytics.service";
import type { PublishedSite } from "@/types";

const SITE_BASE = "https://lovecraft.ai";
const DEFAULT_OG = `${SITE_BASE}/branding/og-default.png`;

// ── Head loader ────────────────────────────────────────────────────
// TanStack Start supports a loaderDeps + loader pattern for SSR.
// We keep the head() simple and SSR-friendly by reading loaderData.
export const Route = createFileRoute("/sites/$siteId")({
  // Loader fetches the site record on the server for SSR head injection.
  loader: async ({ params }) => {
    try {
      const result = await publishService.getSite(params.siteId);
      if (!result) return { site: null };
      return { site: result.site };
    } catch {
      return { site: null };
    }
  },
  head: ({ loaderData }) => {
    const site = loaderData?.site ?? null;
    const siteId = site?.id ?? "";
    const canonical = `${SITE_BASE}/sites/${siteId}`;

    // Determine indexability:
    // Index ONLY when: status === "active" AND is_public !== false AND seo_noindex !== true
    const isPublic =
      site?.status === "active" &&
      site?.is_public !== false &&
      !((site as unknown as Record<string, unknown>)?.seo_noindex);

    const robots = isPublic ? "index,follow" : "noindex,nofollow";

    // Build dynamic title & description from real site data
    const siteTitle = site?.title ?? "A Beautiful Memory";
    const websiteType = site?.website_type ?? "website";
    const title = site ? `${siteTitle} | LoveCraft.ai` : "A Love Story | LoveCraft.ai";
    const description = site
      ? `Explore the ${websiteType} website created for ${siteTitle}. Made with LoveCraft.ai.`
      : "Explore this beautiful website created with LoveCraft.ai.";
    const ogImage =
      ((site as unknown as Record<string, unknown>)?.og_image_url as string | null) ??
      site?.preview_image ??
      DEFAULT_OG;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: robots },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonical },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: SiteViewerPage,
});

function SiteViewerPage() {
  const { siteId } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Use the site metadata already loaded by the route loader if available
  const [site, setSite] = useState<PublishedSite | null>(loaderData?.site ?? null);

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
    return () => {
      cancelled = true;
    };
  }, [siteId]);

  // ── Loading screen ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
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
          <p className="font-display italic text-xl text-ivory">Opening your story…</p>
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
          <h1 className="font-display text-3xl text-ivory mb-3">This memory doesn't exist</h1>
          <p className="text-ivory/50 mb-8">
            The story you're looking for may have been removed or made private.
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
