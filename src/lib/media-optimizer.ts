// ─────────────────────────────────────────────────────────────────
// Media Optimizer — High performance browser image compression & WebP generation
// Automatically strips EXIF metadata, downsizes images, and produces WebP
// ─────────────────────────────────────────────────────────────────

export interface OptimizationResult {
  dataUrl: string;
  blob: Blob;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  format: "webp" | "jpeg" | "original";
  width: number;
  height: number;
}

const MAX_IMAGE_DIMENSION = 2048; // Max 2048px width/height for web performance
const WEBP_QUALITY = 0.85;        // Crisp visual quality with ~70% size reduction

/** Compress image to WebP with EXIF stripping and max dimension scaling */
export async function optimizeImage(dataUrlOrFile: string | File): Promise<OptimizationResult> {
  let sourceUrl: string;
  let originalSize = 0;

  if (typeof dataUrlOrFile === "string") {
    sourceUrl = dataUrlOrFile;
    // Estimate byte size from dataURL
    const base64Str = dataUrlOrFile.split(",")[1] ?? "";
    originalSize = Math.round((base64Str.length * 3) / 4);
  } else {
    sourceUrl = URL.createObjectURL(dataUrlOrFile);
    originalSize = dataUrlOrFile.size;
  }

  // SVG, GIF animation preservation — don't redraw onto static canvas
  if (typeof dataUrlOrFile !== "string" && (dataUrlOrFile.type.includes("svg") || dataUrlOrFile.type.includes("gif"))) {
    const arrayBuf = await dataUrlOrFile.arrayBuffer();
    const blob = new Blob([arrayBuf], { type: dataUrlOrFile.type });
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    return {
      dataUrl,
      blob,
      originalSizeBytes: originalSize,
      optimizedSizeBytes: originalSize,
      format: "original",
      width: 0,
      height: 0,
    };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Scale down proportionally if larger than MAX_IMAGE_DIMENSION
      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
          width = MAX_IMAGE_DIMENSION;
        } else {
          width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
          height = MAX_IMAGE_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("Canvas 2D context unavailable"));
      }

      // Smooth scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw image onto canvas (automatically strips EXIF metadata)
      ctx.drawImage(img, 0, 0, width, height);

      // Export as image/webp if supported, fallback to image/jpeg
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            // Fallback to jpeg dataURL
            const jpegUrl = canvas.toDataURL("image/jpeg", WEBP_QUALITY);
            return resolve({
              dataUrl: jpegUrl,
              blob: dataUrlToBlob(jpegUrl),
              originalSizeBytes: originalSize,
              optimizedSizeBytes: Math.round((jpegUrl.length * 3) / 4),
              format: "jpeg",
              width,
              height,
            });
          }

          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            resolve({
              dataUrl,
              blob,
              originalSizeBytes: originalSize,
              optimizedSizeBytes: blob.size,
              format: "webp",
              width,
              height,
            });
          };
          reader.readAsDataURL(blob);
        },
        "image/webp",
        WEBP_QUALITY,
      );
    };

    img.onerror = () => reject(new Error("Failed to load image for optimization"));
    img.src = sourceUrl;
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
