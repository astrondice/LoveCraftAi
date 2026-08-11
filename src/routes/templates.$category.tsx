// ─────────────────────────────────────────────────────────────────
// /templates/$category — Category Template Gallery
// SEO-optimised public page for each template category.
// Only shows templates with status === "published".
// ─────────────────────────────────────────────────────────────────
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { getCategoryBySlug, CATEGORY_LIST } from "@/lib/categories.data";
import { TEMPLATE_LIST } from "@/lib/templates.data";
import type { TemplateSpec } from "@/lib/templates.data";
import { Logo } from "@/components/ui/Logo";
import { BackgroundFX } from "@/components/animations/BackgroundFX";
import { PromotionalShowcase } from "@/components/promo/PromotionalShowcase";
import { getCategorySeo } from "@/lib/seo";
import { ArrowRight, Sparkles, Clock, Smartphone, Moon } from "lucide-react";

const SITE_BASE = "https://lovecraft.ai";
const DEFAULT_OG = `${SITE_BASE}/branding/og-default.png`;

const VALID_CATEGORIES = new Set([
  "all", "love", "raksha-bandhan", "birthday", "wedding", "business",
  "portfolio", "startup", "resume", "saas", "restaurant", "education", "festival",
]);

export const Route = createFileRoute("/templates/$category")({
  loader: ({ params }) => {
    const { category } = params;
    if (!VALID_CATEGORIES.has(category)) {
      throw notFound();
    }
    const cat = getCategoryBySlug(category);
    const templates = TEMPLATE_LIST.filter(
      (t) => (category === "all" || t.category === category) && t.status === "published",
    );
    return { cat, templates, slug: category };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ name: "robots", content: "noindex" }] };
    const { slug } = loaderData;
    const seo = getCategorySeo(slug);
    const canonical = `${SITE_BASE}/templates/${slug}`;

    return {
      meta: [
        { title: seo.title },
        { name: "description", content: seo.description },
        { name: "robots", content: "index,follow" },
        { property: "og:title", content: seo.title },
        { property: "og:description", content: seo.description },
        { property: "og:url", content: canonical },
        { property: "og:image", content: DEFAULT_OG },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:title", content: seo.title },
        { name: "twitter:description", content: seo.description },
        { name: "twitter:image", content: DEFAULT_OG },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_BASE}/` },
              { "@type": "ListItem", position: 2, name: "Templates", item: `${SITE_BASE}/templates` },
              { "@type": "ListItem", position: 3, name: loaderData.cat.name, item: canonical },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: seo.title,
            url: canonical,
            description: seo.description,
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="font-display text-8xl text-ivory/10 mb-4">404</p>
        <h1 className="font-display text-3xl text-ivory mb-3">Category not found</h1>
        <p className="text-ivory/50 mb-8">
          That template category doesn't exist. Browse all our available templates.
        </p>
        <a
          href="/templates"
          className="inline-flex items-center gap-2 rounded-full bg-gold text-charcoal px-6 py-3 label-caps text-[11px]"
        >
          Browse All Templates
        </a>
      </div>
    </div>
  ),
  component: CategoryPage,
});

function TemplateCard({ template }: { template: TemplateSpec }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="glass-panel rounded-3xl overflow-hidden border border-ivory/10 hover:border-gold/40 shadow-xl hover:shadow-2xl hover:shadow-gold/5 flex flex-col group"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-charcoal/50">
        <img
          src={template.thumbnail}
          alt={`${template.name} — ${template.categoryName} website template`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
          decoding="async"
          width={800}
          height={500}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent" />

        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {template.badge && (
            <span
              className={`px-2.5 py-0.5 rounded-full label-caps text-[9px] font-bold ${
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
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-charcoal/80 backdrop-blur border border-ivory/15 text-ivory/70 label-caps text-[9px]">
          <Clock size={10} className="text-gold" />
          <span>{template.setupTime} setup</span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display text-xl text-ivory group-hover:text-gold transition-colors mb-1">
          {template.name}
        </h3>
        <p className="text-ivory/60 text-xs leading-relaxed mb-4 flex-1 line-clamp-2">
          {template.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {template.responsive && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ivory/5 border border-ivory/10 text-ivory/60 text-[9px] label-caps">
              <Smartphone size={9} className="text-sky-400" /> Responsive
            </span>
          )}
          {template.darkMode && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ivory/5 border border-ivory/10 text-ivory/60 text-[9px] label-caps">
              <Moon size={9} className="text-purple-400" /> Dark Mode
            </span>
          )}
          {template.aiReady && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ivory/5 border border-ivory/10 text-ivory/60 text-[9px] label-caps">
              <Sparkles size={9} className="text-gold" /> AI Ready
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 pt-3 border-t border-ivory/10">
          <Link
            to="/generate"
            className="flex-1 py-2.5 rounded-xl bg-gold hover:bg-gold/90 text-charcoal font-bold text-xs label-caps flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-gold/10"
          >
            Use Template
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function CategoryPage() {
  const { cat, templates, slug } = Route.useLoaderData();
  const seo = getCategorySeo(slug);

  const relatedCategories = CATEGORY_LIST.filter(
    (c) => c.id !== "all" && c.id !== slug,
  ).slice(0, 6);

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
          <a href="/templates" className="hover:text-ivory transition-colors label-caps">Templates</a>
          <span className="text-gold label-caps">{cat.name}</span>
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
            <li><a href="/templates" className="hover:text-ivory transition-colors">Templates</a></li>
            <li><span className="mx-1">/</span></li>
            <li className="text-gold">{cat.name}</li>
          </ol>
        </nav>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-14"
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{cat.emoji}</span>
            {cat.badge && (
              <span className="px-3 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold label-caps text-[10px] font-bold">
                {cat.badge}
              </span>
            )}
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-ivory tracking-tight mb-4">
            {seo.h1}
          </h1>
          <p className="text-ivory/70 text-lg md:text-xl max-w-2xl leading-relaxed font-light">
            {seo.intro}
          </p>
          {templates.length > 0 && (
            <p className="mt-4 text-ivory/40 text-sm label-caps mb-8">
              {templates.length} published template{templates.length !== 1 ? "s" : ""} available
            </p>
          )}
          <div className="max-w-3xl">
            <PromotionalShowcase category={slug} />
          </div>
        </motion.div>

        {/* Template grid — only published templates */}
        {templates.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {templates.map((template: TemplateSpec, idx: number) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.07 }}
              >
                <TemplateCard template={template} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 mb-20">
            <p className="font-display text-3xl text-ivory/30 mb-4">Coming Soon</p>
            <p className="text-ivory/50 text-sm mb-8">
              We're crafting premium templates for this category. Check back soon.
            </p>
            <a
              href="/templates"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-ivory/20 text-ivory/60 hover:text-ivory hover:border-ivory/40 transition-all label-caps text-xs"
            >
              <ArrowRight size={14} />
              Browse Other Categories
            </a>
          </div>
        )}

        {/* Category intro content */}
        <section className="glass-panel rounded-3xl p-8 md:p-12 border border-ivory/10 mb-16">
          <h2 className="font-display text-3xl text-ivory mb-4">
            About {cat.name} Templates
          </h2>
          <p className="text-ivory/70 leading-relaxed text-lg mb-6">{seo.intro}</p>
          {cat.popularTags && (
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {cat.popularTags.slice(0, 4).map((tag: string) => (
                <div key={tag} className="flex items-center gap-3 text-ivory/60 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                  {tag}
                </div>
              ))}
            </div>
          )}
          <Link
            to="/generate"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gold text-charcoal font-bold label-caps text-xs hover:bg-gold/90 transition-colors shadow-lg shadow-gold/20"
          >
            <Sparkles size={14} />
            Create Your {cat.name} Website Free
          </Link>
        </section>

        {/* Related categories — internal linking */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-ivory mb-6">
            Explore Other Categories
          </h2>
          <div className="flex flex-wrap gap-3">
            {relatedCategories.map((relCat) => (
              <a
                key={relCat.id}
                href={`/templates/${relCat.slug}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full glass-panel border border-ivory/15 hover:border-gold/40 text-ivory/60 hover:text-ivory transition-all text-sm"
              >
                <span>{relCat.emoji}</span>
                <span className="label-caps text-[11px]">{relCat.name}</span>
              </a>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-ivory/10 py-10 px-6 md:px-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="font-display text-xl text-ivory">
            LoveCraft<span className="text-gold">AI</span>
          </Link>
          <nav aria-label="Footer navigation" className="flex items-center gap-6 label-caps text-ivory/50 text-[11px]">
            <Link to="/" className="hover:text-ivory transition-colors">Home</Link>
            <a href="/templates" className="hover:text-ivory transition-colors">All Templates</a>
            <Link to="/generate" className="hover:text-ivory transition-colors">Create</Link>
          </nav>
          <p className="text-ivory/30 text-xs">© 2025 LoveCraft.ai</p>
        </div>
      </footer>
    </div>
  );
}
