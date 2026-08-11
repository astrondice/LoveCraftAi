// ─────────────────────────────────────────────────────────────────
// /templates — Public Template Hub
// Crawlable index of all template categories with real content.
// ─────────────────────────────────────────────────────────────────
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CATEGORY_LIST } from "@/lib/categories.data";
import { TEMPLATE_LIST } from "@/lib/templates.data";
import { Logo } from "@/components/ui/Logo";
import { BackgroundFX } from "@/components/animations/BackgroundFX";
import { ArrowRight, Sparkles } from "lucide-react";

const CANONICAL = "https://lovecraft.ai/templates";
const OG_IMAGE = "https://lovecraft.ai/branding/og-default.png";

const PUBLISHED_STATUS = new Set(["published"]);

function getCategoryPublishedCount(categoryId: string): number {
  return TEMPLATE_LIST.filter(
    (t) => t.category === categoryId && PUBLISHED_STATUS.has(t.status),
  ).length;
}

export const Route = createFileRoute("/templates/")({
  head: () => ({
    meta: [
      {
        title: "AI Website Templates — Love, Wedding, Birthday & More | LoveCraft.ai",
      },
      {
        name: "description",
        content:
          "Browse beautiful AI website templates for every occasion — love stories, Raksha Bandhan, birthdays, weddings, portfolios and businesses. Free to customise and publish instantly.",
      },
      { name: "robots", content: "index,follow" },
      {
        property: "og:title",
        content: "AI Website Templates — Love, Wedding, Birthday & More | LoveCraft.ai",
      },
      {
        property: "og:description",
        content:
          "Browse beautiful AI website templates for every occasion. Free to customise and publish instantly.",
      },
      { property: "og:url", content: CANONICAL },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        name: "twitter:title",
        content: "AI Website Templates — Love, Wedding, Birthday & More | LoveCraft.ai",
      },
      {
        name: "twitter:description",
        content:
          "Browse beautiful AI website templates for every occasion. Free to customise and publish instantly.",
      },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://lovecraft.ai/" },
            { "@type": "ListItem", position: 2, name: "Templates", item: CANONICAL },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "AI Website Templates — LoveCraft.ai",
          url: CANONICAL,
          description:
            "Browse beautiful AI website templates for every occasion — love stories, Raksha Bandhan, birthdays, weddings, portfolios and businesses.",
        }),
      },
    ],
  }),
  component: TemplatesHubPage,
});

function TemplatesHubPage() {
  const publishedCount = TEMPLATE_LIST.filter((t) => PUBLISHED_STATUS.has(t.status)).length;

  const visibleCategories = CATEGORY_LIST.filter(
    (cat) => cat.id !== "all",
  );

  return (
    <div className="relative min-h-screen bg-charcoal">
      <BackgroundFX />

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-16 py-5 backdrop-blur-xl bg-charcoal/30 border-b border-ivory/10">
        <Link to="/" className="flex items-center">
          <Logo className="h-8 md:h-10" />
        </Link>
        <div className="hidden md:flex items-center gap-8 text-ivory/60 text-sm">
          <Link to="/" className="hover:text-ivory transition-colors label-caps">Home</Link>
          <span className="text-gold label-caps">Templates</span>
          <Link to="/generate" className="hover:text-ivory transition-colors label-caps">Create</Link>
        </div>
        <Link
          to="/generate"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold text-charcoal font-bold text-xs label-caps hover:bg-gold/90 transition-colors"
        >
          <Sparkles size={13} />
          Start Free
        </Link>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6 md:px-16 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-ivory/50 text-xs label-caps">
            <li><Link to="/" className="hover:text-ivory transition-colors">Home</Link></li>
            <li><span className="mx-1">/</span></li>
            <li className="text-gold">Templates</li>
          </ol>
        </nav>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full border border-ivory/30 bg-charcoal/40 backdrop-blur-md label-caps text-ivory/80 mb-6 text-xs">
            ✦ {publishedCount} Published Templates
          </span>
          <h1 className="font-display text-5xl md:text-7xl text-ivory tracking-tight mb-6">
            Browse All{" "}
            <span className="italic font-light" style={{ color: "#D4AF37" }}>
              Templates
            </span>
          </h1>
          <p className="text-ivory/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
            Beautiful AI-powered website templates for every occasion — love stories, Raksha
            Bandhan memories, birthdays, weddings, portfolios and businesses. Free to customise
            and publish instantly.
          </p>
        </motion.div>

        {/* Category Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleCategories.map((cat, idx) => {
            const count = getCategoryPublishedCount(cat.id);
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
              >
                {/* Use plain <a> — typed Link will work after routeTree.gen.ts regenerates */}
                <a
                  href={`/templates/${cat.slug}`}
                  className="group block glass-panel rounded-3xl p-8 border border-ivory/10 hover:border-gold/40 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{cat.emoji}</span>
                    {cat.badge && (
                      <span className="px-2.5 py-0.5 rounded-full bg-gold/20 border border-gold/40 text-gold label-caps text-[9px] font-bold">
                        {cat.badge}
                      </span>
                    )}
                  </div>
                  <h2 className="font-display text-2xl text-ivory group-hover:text-gold transition-colors mb-2">
                    {cat.name}
                  </h2>
                  <p className="text-ivory/60 text-sm leading-relaxed mb-4 line-clamp-2">
                    {cat.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-ivory/40 text-xs label-caps">
                      {count > 0 ? `${count} template${count !== 1 ? "s" : ""}` : "Coming soon"}
                    </span>
                    <ArrowRight
                      size={16}
                      className="text-ivory/30 group-hover:text-gold group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </a>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <h2 className="font-display text-3xl md:text-4xl text-ivory mb-4">
            Ready to create your website?
          </h2>
          <p className="text-ivory/60 text-lg mb-8">
            Choose a template and build your story in minutes — completely free.
          </p>
          <Link
            to="/generate"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gold text-charcoal font-bold label-caps hover:bg-gold/90 transition-colors text-sm shadow-lg shadow-gold/20"
          >
            <Sparkles size={16} />
            Create Your Website Free
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-ivory/10 py-10 px-6 md:px-16 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="font-display text-xl text-ivory">
            LoveCraft<span className="text-gold">AI</span>
          </Link>
          <nav aria-label="Footer navigation" className="flex items-center gap-6 label-caps text-ivory/50 text-[11px]">
            <Link to="/" className="hover:text-ivory transition-colors">Home</Link>
            <a href="/templates" className="hover:text-ivory transition-colors text-gold">Templates</a>
            <Link to="/generate" className="hover:text-ivory transition-colors">Create</Link>
          </nav>
          <p className="text-ivory/30 text-xs">© 2025 LoveCraft.ai</p>
        </div>
      </footer>
    </div>
  );
}
