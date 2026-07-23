// ─────────────────────────────────────────────────────────────────
// QRCodeDisplay — Inline QR code using the qrcode library
// ─────────────────────────────────────────────────────────────────
import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QRCodeDisplayProps {
  url: string;
  size?: number;
}

export function QRCodeDisplay({ url, size = 160 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    QRCode.toCanvas(canvas, url, {
      width: size,
      margin: 2,
      color: {
        dark: "#131313",
        light: "#faf9f6",
      },
    }).catch(console.error);
  }, [url, size]);

  return (
    <div className="rounded-2xl overflow-hidden inline-block border border-ivory/20 p-3 bg-ivory/5">
      <canvas ref={canvasRef} width={size} height={size} />
    </div>
  );
}
