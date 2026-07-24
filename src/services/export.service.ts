// ─────────────────────────────────────────────────────────────────
// Export Service — One-click static ZIP, HTML & React package export
// ─────────────────────────────────────────────────────────────────
import JSZip from "jszip";
import type { PublishedSite } from "@/types";

export type ExportFormat = "html" | "zip" | "react" | "next";

export const exportService = {
  /** Export website as downloadable ZIP package or HTML file */
  async exportSite(site: PublishedSite, htmlContent: string, format: ExportFormat = "zip"): Promise<void> {
    const safeTitle = site.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "love-story";

    if (format === "html") {
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      downloadBlob(blob, `${safeTitle}.html`);
      return;
    }

    const zip = new JSZip();

    // 1. Standalone index.html
    zip.file("index.html", htmlContent);

    // 2. README.md
    zip.file(
      "README.md",
      `# ${site.title}\n\nExported from LoveCraft.ai on ${new Date().toLocaleDateString()}.\n\n` +
        `## Quick Start\nOpen \`index.html\` directly in any browser or host on Vercel, Netlify, or GitHub Pages.\n`
    );

    // 3. React / Next.js Component wrapper
    if (format === "react" || format === "next") {
      const componentCode = `import React from 'react';

export default function ${safeTitle.replace(/-/g, "_")}() {
  return (
    <div dangerouslySetInnerHTML={{ __html: ${JSON.stringify(htmlContent)} }} />
  );
}
`;
      zip.file(`LoveStory.jsx`, componentCode);
    }

    const content = await zip.generateAsync({ type: "blob" });
    downloadBlob(content, `${safeTitle}-export.zip`);
  },
};

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
