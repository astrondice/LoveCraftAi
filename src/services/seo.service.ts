// ─────────────────────────────────────────────────────────────────
// Advanced Automated SEO & JSON-LD Generator
// ─────────────────────────────────────────────────────────────────
import type { PublishInput } from "@/types";

export interface SeoMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: "summary" | "summary_large_image";
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  jsonLd: Record<string, unknown>;
}

export const seoService = {
  /** Automatically generate complete SEO metadata for a love story */
  generateSeo(input: PublishInput, siteUrl: string, previewImageUrl?: string): SeoMetadata {
    const coupleName = `${input.name1.trim()} & ${input.name2.trim()}`;
    const dateText = input.date ? ` — ${input.date}` : "";
    const title = `${coupleName}'s Love Story | LoveCraft AI${dateText}`;
    
    // Heuristic & AI meta description extraction
    const rawMemory = (input.memory || input.message || "").replace(/<[^>]*>/g, "").trim();
    const snippet = rawMemory.length > 150 ? `${rawMemory.slice(0, 147)}...` : rawMemory;
    const description = snippet || `Explore the beautiful digital love story of ${coupleName}. Created with LoveCraft AI.`;

    const keywords = [
      coupleName,
      "Love Story",
      "Anniversary",
      "Digital Keepsake",
      "LoveCraft AI",
      input.name1,
      input.name2,
    ];

    const ogImage = previewImageUrl || "https://lovecraft.ai/og-default.jpg";

    // Schema.org JSON-LD Structured Data
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": title,
      "description": description,
      "url": siteUrl,
      "image": ogImage,
      "inLanguage": "en-US",
      "mainEntity": {
        "@type": "CreativeWork",
        "name": `${coupleName}'s Memory Box`,
        "author": {
          "@type": "Person",
          "name": input.name1,
        },
        "headline": snippet || `A love story of ${coupleName}`,
        "dateCreated": new Date().toISOString(),
      },
    };

    return {
      title,
      description,
      keywords,
      canonicalUrl: siteUrl,
      ogTitle: `${coupleName} — Our Love Story`,
      ogDescription: description,
      ogImage,
      ogType: "website",
      twitterCard: "summary_large_image",
      twitterTitle: `${coupleName} — Our Love Story`,
      twitterDescription: description,
      twitterImage: ogImage,
      jsonLd,
    };
  },

  /** Render HTML SEO tags string for injection into head */
  renderSeoHeadTags(metadata: SeoMetadata): string {
    return `
    <!-- SEO Core -->
    <title>${escapeHtml(metadata.title)}</title>
    <meta name="description" content="${escapeHtml(metadata.description)}">
    <meta name="keywords" content="${escapeHtml(metadata.keywords.join(", "))}">
    <link rel="canonical" href="${escapeHtml(metadata.canonicalUrl)}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="index, follow">

    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="${metadata.ogType}">
    <meta property="og:url" content="${escapeHtml(metadata.canonicalUrl)}">
    <meta property="og:title" content="${escapeHtml(metadata.ogTitle)}">
    <meta property="og:description" content="${escapeHtml(metadata.ogDescription)}">
    <meta property="og:image" content="${escapeHtml(metadata.ogImage)}">
    <meta property="og:site_name" content="LoveCraft AI">

    <!-- Twitter / X Card -->
    <meta name="twitter:card" content="${metadata.twitterCard}">
    <meta name="twitter:url" content="${escapeHtml(metadata.canonicalUrl)}">
    <meta name="twitter:title" content="${escapeHtml(metadata.twitterTitle)}">
    <meta name="twitter:description" content="${escapeHtml(metadata.twitterDescription)}">
    <meta name="twitter:image" content="${escapeHtml(metadata.twitterImage)}">

    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
      ${JSON.stringify(metadata.jsonLd)}
    </script>
    `.trim();
  },
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
