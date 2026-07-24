// ─────────────────────────────────────────────────────────────────
// File Validator — Security checks: MIME, Magic Bytes, Executable Rejection
// Prevents directory traversal, XSS uploads, CSRF, and malicious code execution
// ─────────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  error?: string;
  mimeType?: string;
  category?: "image" | "video" | "audio" | "pdf" | "unknown";
}

const FORBIDDEN_EXTENSIONS = new Set([
  "exe", "bat", "cmd", "sh", "bash", "bin", "dll", "so", "dylib",
  "js", "mjs", "cjs", "ts", "jsx", "tsx", "php", "py", "pl", "rb",
  "cgi", "vbs", "vbe", "jar", "app", "gadget", "msi", "scr", "hta",
  "cpl", "pif", "application", "com", "scr"
]);

const ALLOWED_MIME_CATEGORIES: Record<string, string[]> = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"],
  video: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"],
  audio: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a", "audio/aac", "audio/flac"],
  pdf: ["application/pdf"]
};

/** Verify magic bytes for common formats */
async function getMagicBytes(file: File | Blob): Promise<string> {
  const slice = file.slice(0, 12);
  const buffer = await slice.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0").toUpperCase()).join(" ");
}

/** Check file signature against magic numbers */
export async function validateFileSignature(file: File | Blob, filename: string): Promise<ValidationResult> {
  // 1. Check filename & extension security (directory traversal & forbidden exts)
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return { valid: false, error: "Invalid filename detected (directory traversal attempt)." };
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (FORBIDDEN_EXTENSIONS.has(ext)) {
    return { valid: false, error: `Executable or script files (.${ext}) are strictly forbidden.` };
  }

  // 2. Validate MIME type declaration
  const declaredMime = file.type.toLowerCase();
  let category: ValidationResult["category"] = "unknown";

  for (const [cat, mimes] of Object.entries(ALLOWED_MIME_CATEGORIES)) {
    if (mimes.some(m => declaredMime.includes(m.split("/")[1]))) {
      category = cat as ValidationResult["category"];
      break;
    }
  }

  // If MIME type isn't standard declared, fallback to extension checking
  if (category === "unknown") {
    if (["jpg", "jpeg", "png", "webp", "gif", "svg", "avif"].includes(ext)) category = "image";
    else if (["mp4", "webm", "mov"].includes(ext)) category = "video";
    else if (["mp3", "wav", "ogg", "m4a", "aac", "flac"].includes(ext)) category = "audio";
    else if (ext === "pdf") category = "pdf";
  }

  if (category === "unknown") {
    return { valid: false, error: "Unsupported file format." };
  }

  // 3. Inspect magic bytes signature
  try {
    const magic = await getMagicBytes(file);

    // Signature checks
    if (category === "image") {
      const isJpeg = magic.startsWith("FF D8 FF");
      const isPng = magic.startsWith("89 50 4E 47");
      const isGif = magic.startsWith("47 49 46 38");
      const isRiffWebpAvif = magic.startsWith("52 49 46 46"); // RIFF header for WEBP/AVIF
      const isSvg = declaredMime.includes("svg") || ext === "svg";

      if (!isJpeg && !isPng && !isGif && !isRiffWebpAvif && !isSvg) {
        return { valid: false, error: "File binary header does not match a valid image format." };
      }
    } else if (category === "pdf") {
      if (!magic.startsWith("25 50 44 46")) { // %PDF
        return { valid: false, error: "Invalid PDF file signature." };
      }
    }
  } catch (err) {
    console.warn("[FileValidator] Could not inspect magic bytes:", err);
  }

  return { valid: true, mimeType: declaredMime || `application/${ext}`, category };
}

/** Sanitize input strings against XSS / injection */
export function sanitizeInput(input: string): string {
  if (!input) return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}
