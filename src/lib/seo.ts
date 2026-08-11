// ─────────────────────────────────────────────────────────────────
// SEO Utility — Single Source of Truth for LoveCraft.ai
// ─────────────────────────────────────────────────────────────────
// All public-facing canonical URLs and sitemap entries use getSiteUrl().
// Never hardcode localhost or preview deployment URLs here.

/**
 * Returns the canonical production domain.
 *
 * Priority:
 *   1. VITE_APP_URL env var (set on Vercel / Cloudflare to https://lovecraft.ai)
 *   2. window.location.origin in the browser (dev-safe)
 *   3. Hardcoded production domain as ultimate fallback
 *
 * This function is safe to call on both server (SSR) and client.
 */
export function getSiteUrl(): string {
  // Server-side: use the env var that should be set to the production domain
  if (typeof window === "undefined") {
    const envUrl = import.meta.env.VITE_APP_URL as string | undefined;
    if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
      return envUrl.replace(/\/$/, "");
    }
    // SSR fallback — always use the real production domain
    return "https://lovecraft.ai";
  }
  // Client-side: window.location.origin is always correct (dev or prod)
  return window.location.origin;
}

/** Build an absolute URL from a path segment */
export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalised}`;
}

// ─────────────────────────────────────────────────────────────────
// DEFAULT OG IMAGE
// ─────────────────────────────────────────────────────────────────
// Stored in /public/branding/. Replace with a real 1200×630 image.
export const DEFAULT_OG_IMAGE = absoluteUrl("/branding/og-default.png");
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface PageMetaOptions {
  title: string;
  description: string;
  /** Absolute canonical URL — use absoluteUrl() */
  canonical: string;
  /** Absolute OG image URL. Defaults to DEFAULT_OG_IMAGE */
  ogImage?: string;
  ogType?: "website" | "article";
  robots?: string;
}

export interface MetaTag {
  title?: string;
  name?: string;
  property?: string;
  content?: string;
  charSet?: string;
}

export interface LinkTag {
  rel: string;
  href: string;
  type?: string;
  sizes?: string;
  crossOrigin?: string;
}

export interface ScriptTag {
  type: string;
  children: string;
}

export interface HeadOutput {
  meta: MetaTag[];
  links?: LinkTag[];
  scripts?: ScriptTag[];
}

// ─────────────────────────────────────────────────────────────────
// CORE META BUILDER
// ─────────────────────────────────────────────────────────────────

/**
 * Builds a complete, consistent meta array for a TanStack Start route head().
 * Covers: title, description, canonical, OG, Twitter/X, robots.
 */
export function buildPageMeta(opts: PageMetaOptions): HeadOutput {
  const ogImage = opts.ogImage ?? DEFAULT_OG_IMAGE;
  const ogType = opts.ogType ?? "website";
  const robots = opts.robots ?? "index,follow";

  const meta: MetaTag[] = [
    { title: opts.title },
    { name: "description", content: opts.description },
    { name: "robots", content: robots },
    // Open Graph
    { property: "og:type", content: ogType },
    { property: "og:url", content: opts.canonical },
    { property: "og:title", content: opts.title },
    { property: "og:description", content: opts.description },
    { property: "og:image", content: ogImage },
    { property: "og:image:width", content: String(OG_IMAGE_WIDTH) },
    { property: "og:image:height", content: String(OG_IMAGE_HEIGHT) },
    { property: "og:site_name", content: "LoveCraft.ai" },
    // Twitter/X
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: opts.title },
    { name: "twitter:description", content: opts.description },
    { name: "twitter:image", content: ogImage },
  ];

  const links: LinkTag[] = [
    { rel: "canonical", href: opts.canonical },
  ];

  return { meta, links };
}

// ─────────────────────────────────────────────────────────────────
// JSON-LD BUILDER
// ─────────────────────────────────────────────────────────────────

/** Wraps a schema.org object into a <script type="application/ld+json"> tag */
export function buildJsonLd(schema: Record<string, unknown>): ScriptTag {
  return {
    type: "application/ld+json",
    children: JSON.stringify(schema),
  };
}

/** WebSite + SearchAction schema for the homepage */
export function buildWebSiteSchema(): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LoveCraft.ai",
    url: siteUrl,
    description:
      "Create beautiful cinematic websites with AI — love stories, Raksha Bandhan memories, birthdays, weddings and more.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/templates?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** WebApplication schema for the app */
export function buildWebApplicationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "LoveCraft.ai",
    url: getSiteUrl(),
    applicationCategory: "DesignApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "AI-powered website builder for creating cinematic love stories, Raksha Bandhan memories, birthdays, weddings, and business sites.",
  };
}

/** Organization schema */
export function buildOrganizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LoveCraft.ai",
    url: getSiteUrl(),
    logo: absoluteUrl("/branding/logo.png"),
  };
}

/** BreadcrumbList schema */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** FAQPage schema — only use when real Q&A pairs exist */
export interface FaqItem {
  q: string;
  a: string;
}

export function buildFaqSchema(items: FaqItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

// ─────────────────────────────────────────────────────────────────
// CATEGORY SEO MAP
// Single authoritative source for per-category titles & descriptions
// ─────────────────────────────────────────────────────────────────

export interface CategorySeoData {
  title: string;
  description: string;
  h1: string;
  intro: string;
}

export const CATEGORY_SEO: Record<string, CategorySeoData> = {
  all: {
    title: "AI Website Templates — Browse All Categories | LoveCraft.ai",
    description:
      "Browse beautiful AI-powered website templates for every occasion — love stories, Raksha Bandhan, birthdays, weddings, portfolios and businesses. Free to use.",
    h1: "Browse All Website Templates",
    intro:
      "Explore our complete collection of handcrafted AI website templates. Every template is designed to make your story come alive — from romantic love websites to professional business pages.",
  },
  love: {
    title: "Love Website Templates & Romantic Website Builder | LoveCraft.ai",
    description:
      "Create beautiful romantic websites with photos, memories, stories, music and personalised moments. Celebrate love with cinematic AI-powered templates.",
    h1: "Love & Romance Website Templates",
    intro:
      "Turn your photos, music and memories into a stunning cinematic love website. Perfect for anniversaries, proposals, relationships and romantic milestones. Choose from 10 handcrafted romantic templates.",
  },
  "raksha-bandhan": {
    title: "Raksha Bandhan Website Templates | Brother-Sister Memories | LoveCraft.ai",
    description:
      "Create a beautiful Raksha Bandhan website for your brother or sister with photos, memories, messages, videos and heartfelt moments. Celebrate the purest bond with AI.",
    h1: "Raksha Bandhan Website Templates",
    intro:
      "Celebrate the special bond between brothers and sisters with a beautiful digital memory website. Share childhood photos, heartfelt messages, and unforgettable memories through stunning AI-powered templates made for Raksha Bandhan.",
  },
  birthday: {
    title: "Birthday Website Templates | Create a Surprise Digital Gift | LoveCraft.ai",
    description:
      "Create a stunning birthday surprise website with photos, videos, messages and confetti effects. The perfect digital gift for birthdays of all ages.",
    h1: "Birthday Celebration Website Templates",
    intro:
      "Give the perfect digital birthday gift — a personalised celebration website packed with photos, video messages, wishes and surprises. Build it in minutes with AI.",
  },
  wedding: {
    title: "Wedding Website Templates — RSVP, Itinerary & Love Stories | LoveCraft.ai",
    description:
      "Create a beautiful wedding website with RSVP forms, event itinerary, love story and photo galleries. Share your special day with guests elegantly.",
    h1: "Wedding Website Templates",
    intro:
      "Share your wedding day beautifully with a luxurious digital experience — RSVP management, venue details, photo galleries and your love story, all in one elegant website.",
  },
  business: {
    title: "Business Website Templates — Professional Landing Pages | LoveCraft.ai",
    description:
      "Create modern, high-converting business websites with professional landing pages, team showcases, contact forms and brand portfolios using AI.",
    h1: "Business Website Templates",
    intro:
      "Launch a professional business website that converts visitors. Choose from sleek corporate templates with feature sections, testimonials, pricing and contact forms — all built with AI.",
  },
  portfolio: {
    title: "Portfolio Website Templates for Designers & Creators | LoveCraft.ai",
    description:
      "Create a stunning portfolio website to showcase your work — designed for photographers, designers, developers and creative professionals.",
    h1: "Creative Portfolio Website Templates",
    intro:
      "Make your work unforgettable with a beautifully designed portfolio website. Dynamic galleries, case studies, interactive resumes and contact forms — all in minutes.",
  },
  startup: {
    title: "Startup Landing Page Templates — Product Launch Sites | LoveCraft.ai",
    description:
      "Create high-impact startup landing pages with animated features, pricing tables and lead capture forms. Launch your product fast with AI.",
    h1: "Startup Landing Page Templates",
    intro:
      "Launch your product or app with a high-converting startup landing page. Animated feature sections, pricing tier cards, waitlist collection and live demo embeds — built in minutes.",
  },
  resume: {
    title: "Interactive Digital Resume Templates | Online CV Builder | LoveCraft.ai",
    description:
      "Create an impressive interactive digital resume with career timelines, skill radars, project links and downloadable CVs. Stand out to recruiters.",
    h1: "Interactive Digital Resume Templates",
    intro:
      "Stand out with an interactive online resume that showcases your skills, experience and projects beautifully. Go beyond a PDF — create a living career story.",
  },
  saas: {
    title: "SaaS Website Templates — Software Landing Pages | LoveCraft.ai",
    description:
      "Convert visitors into trial subscribers with high-converting SaaS landing templates, interactive feature tables, pricing pages and user testimonials.",
    h1: "SaaS Product Landing Page Templates",
    intro:
      "Convert visitors into paying customers with beautifully designed SaaS landing pages. Feature comparisons, subscription tiers, app demo embeds and customer reviews — all AI-powered.",
  },
  restaurant: {
    title: "Restaurant Website Templates — Digital Menu & Booking | LoveCraft.ai",
    description:
      "Create a beautiful restaurant website with digital menus, online reservation forms, chef highlights and vivid culinary photography.",
    h1: "Restaurant & Dining Website Templates",
    intro:
      "Present your restaurant beautifully with mouthwatering menus, online table reservations, chef spotlights and location details — all in a stunning digital experience.",
  },
  education: {
    title: "Education Website Templates — Course & Academy Landing Pages | LoveCraft.ai",
    description:
      "Create professional course landing pages, online academy portals and workshop registration sites with curriculum cards and enrollment forms.",
    h1: "Education & Academy Website Templates",
    intro:
      "Promote your courses, workshops and educational programs with structured curriculum cards, instructor bios, student testimonials and enrollment forms — all in one place.",
  },
  festival: {
    title: "Festival Website Templates — Festive Greetings & Celebration Pages | LoveCraft.ai",
    description:
      "Create vibrant festive greeting websites for Diwali, New Year, Christmas and global celebrations with custom wishes, music and glowing animations.",
    h1: "Festival & Celebration Website Templates",
    intro:
      "Celebrate every festival in style with glowing, animated greeting websites. Personalised wishes, music players, countdowns and festive designs for Diwali, New Year, Christmas and more.",
  },
};

/** Get category SEO data, falling back to 'all' if not found */
export function getCategorySeo(slug: string): CategorySeoData {
  return CATEGORY_SEO[slug] ?? CATEGORY_SEO.all;
}
