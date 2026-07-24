// ─────────────────────────────────────────────────────────────────
// SEO Validator & Score Calculator (0-100)
// ─────────────────────────────────────────────────────────────────
import type { SeoMetadata } from "@/services/seo.service";

export interface SeoAuditResult {
  score: number; // 0 - 100
  passedChecks: string[];
  warnings: string[];
  errors: string[];
}

export function auditSeo(metadata: SeoMetadata, htmlContent?: string): SeoAuditResult {
  let score = 100;
  const passedChecks: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  // 1. Title Audit
  if (!metadata.title) {
    score -= 25;
    errors.push("Missing page title");
  } else if (metadata.title.length < 10) {
    score -= 10;
    warnings.push("Page title is too short (< 10 chars)");
  } else if (metadata.title.length > 70) {
    score -= 5;
    warnings.push("Page title exceeds recommended 70 chars");
  } else {
    passedChecks.push("Optimal page title length");
  }

  // 2. Meta Description Audit
  if (!metadata.description) {
    score -= 25;
    errors.push("Missing meta description");
  } else if (metadata.description.length < 50) {
    score -= 10;
    warnings.push("Meta description is too short (< 50 chars)");
  } else if (metadata.description.length > 160) {
    score -= 5;
    warnings.push("Meta description exceeds 160 chars");
  } else {
    passedChecks.push("Optimal meta description");
  }

  // 3. Open Graph & Twitter Cards Audit
  if (metadata.ogImage && metadata.ogTitle) {
    passedChecks.push("Social preview meta tags complete");
  } else {
    score -= 15;
    warnings.push("Incomplete Open Graph tags");
  }

  // 4. JSON-LD Structured Data Audit
  if (metadata.jsonLd) {
    passedChecks.push("Schema.org JSON-LD structured data included");
  } else {
    score -= 15;
    errors.push("Missing JSON-LD structured data");
  }

  // 5. HTML Content ALT attributes check if provided
  if (htmlContent) {
    const imgTagsWithoutAlt = (htmlContent.match(/<img(?![^>]*\balt=)[^>]*>/gi) || []).length;
    if (imgTagsWithoutAlt > 0) {
      score -= Math.min(20, imgTagsWithoutAlt * 5);
      warnings.push(`${imgTagsWithoutAlt} image(s) missing alt text`);
    } else {
      passedChecks.push("All images contain alt text attributes");
    }
  }

  return {
    score: Math.max(0, score),
    passedChecks,
    warnings,
    errors,
  };
}
