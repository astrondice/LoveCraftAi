// ─────────────────────────────────────────────────────────────────
// AdaptiveParticleCanvas — GPU Canvas with Hardware Performance Tiering
// Respects prefers-reduced-motion & Device GPU Capability
// ─────────────────────────────────────────────────────────────────
import { useEffect, useRef } from "react";
import { useThemeTokens } from "@/themes";

interface AdaptiveParticleCanvasProps {
  className?: string;
}

export function AdaptiveParticleCanvas({ className = "" }: AdaptiveParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useThemeTokens();
  const p = theme.particles;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Detect reduced motion preference
    const prefersReducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      return; // Skip particle loop if reduced motion is requested
    }

    // Hardware capability check (low power / mobile tiering)
    const isLowPower = typeof navigator !== "undefined" && (navigator.hardwareConcurrency || 4) <= 4;
    const particleCount = isLowPower ? p.countMedium : p.countHigh;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const particlesList = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * p.maxRadius + 0.5,
      vy: p.type === "sakura-petals" ? Math.random() * 0.4 + 0.1 : -(Math.random() * p.speed + 0.05),
      vx: p.type === "sakura-petals" ? Math.random() * 0.3 - 0.15 : (Math.random() - 0.5) * 0.1,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    let animId: number;

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particlesList.length; i++) {
        const pt = particlesList[i];
        pt.y += pt.vy;
        pt.x += pt.vx;

        if (pt.y < 0) pt.y = height;
        if (pt.y > height) pt.y = 0;
        if (pt.x < 0) pt.x = width;
        if (pt.x > width) pt.x = 0;

        ctx.fillStyle = p.particleColor;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, [p]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-0 ${className}`}
      aria-hidden="true"
    />
  );
}
