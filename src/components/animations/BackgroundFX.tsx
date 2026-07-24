import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Signature Cinematic Background System
 * Inspired by Apple, A24, and Studio Ghibli.
 * Layered depth, bokeh, warm lighting, and ultra-smooth parallax.
 */
export function BackgroundFX() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = () => mount.clientWidth;
    const h = () => mount.clientHeight;

    const scene = new THREE.Scene();
    // Fog to fade out distant particles for atmospheric depth
    scene.fog = new THREE.FogExp2(0x000000, 0.0015);

    const camera = new THREE.PerspectiveCamera(60, w() / h(), 1, 3000);
    camera.position.z = 600;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    // Cap pixel ratio to 1.5 for performance on high-res displays while keeping it crisp enough
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(w(), h());
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Texture Generators
    function createTexture(
      drawFn: (ctx: CanvasRenderingContext2D, size: number) => void,
      blur: number = 0,
    ) {
      const size = 128;
      const cvs = document.createElement("canvas");
      cvs.width = cvs.height = size;
      const ctx = cvs.getContext("2d")!;
      if (blur > 0) {
        ctx.filter = `blur(${blur}px)`;
      }
      drawFn(ctx, size);
      const tex = new THREE.CanvasTexture(cvs);
      tex.needsUpdate = true;
      return tex;
    }

    const drawHeart = (
      ctx: CanvasRenderingContext2D,
      size: number,
      colorStart: string,
      colorEnd: string,
      glow: string,
    ) => {
      ctx.translate(size / 2, size / 2 - 6);
      ctx.beginPath();
      const s = 36;
      ctx.moveTo(0, s * 0.7);
      ctx.bezierCurveTo(s * 1.1, s * 0.15, s * 0.85, -s * 0.7, 0, -s * 0.1);
      ctx.bezierCurveTo(-s * 0.85, -s * 0.7, -s * 1.1, s * 0.15, 0, s * 0.7);
      ctx.closePath();

      const g = ctx.createRadialGradient(-6, -10, 2, 0, 0, s);
      g.addColorStop(0, "rgba(255,255,255,0.9)");
      g.addColorStop(0.3, colorStart);
      g.addColorStop(1, colorEnd);
      ctx.fillStyle = g;

      ctx.shadowColor = glow;
      ctx.shadowBlur = 15;
      ctx.fill();
    };

    const drawDust = (ctx: CanvasRenderingContext2D, size: number) => {
      const center = size / 2;
      const radius = 12;
      const g = ctx.createRadialGradient(center, center, 0, center, center, radius);
      g.addColorStop(0, "rgba(255, 235, 180, 1)");
      g.addColorStop(0.2, "rgba(255, 215, 120, 0.8)");
      g.addColorStop(1, "rgba(255, 200, 100, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    // Textures with varying depths of field (bokeh blur)
    const texHeartSharp = createTexture(
      (ctx, s) =>
        drawHeart(
          ctx,
          s,
          "rgba(255,215,225,0.9)",
          "rgba(255,110,150,0.4)",
          "rgba(255,120,150,0.6)",
        ),
      0,
    );
    const texHeartBokeh = createTexture(
      (ctx, s) =>
        drawHeart(
          ctx,
          s,
          "rgba(255,215,225,0.7)",
          "rgba(255,110,150,0.2)",
          "rgba(255,120,150,0.4)",
        ),
      8,
    );
    const texDust = createTexture(drawDust, 2);

    // Particle System Builder
    function createParticleSystem(
      count: number,
      texture: THREE.Texture,
      size: number,
      spread: number,
      opacity: number,
      color: number,
    ) {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const phases = new Float32Array(count); // For organic pulsing

      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * spread;
        pos[i * 3 + 1] = (Math.random() - 0.5) * spread;
        pos[i * 3 + 2] = (Math.random() - 0.5) * spread;
        phases[i] = Math.random() * Math.PI * 2;
      }

      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("phase", new THREE.BufferAttribute(phases, 1));

      const mat = new THREE.PointsMaterial({
        color,
        size,
        map: texture,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      return new THREE.Points(geo, mat);
    }

    // --- LAYERS ---

    // Layer 3: Background (Distant, blurred bokeh, slow)
    const bgHearts = createParticleSystem(15, texHeartBokeh, 90, 2500, 0.1, 0xffaab4);
    bgHearts.position.z = -400;

    // Layer 2: Midground (In focus, crisp, elegant)
    const midHearts1 = createParticleSystem(12, texHeartSharp, 35, 1400, 0.25, 0xffffff);
    const midHearts2 = createParticleSystem(10, texHeartSharp, 45, 1600, 0.2, 0xffd28a); // Gold

    // Layer 1: Foreground (Large, heavy bokeh, rare)
    const fgHearts = createParticleSystem(6, texHeartBokeh, 180, 1200, 0.12, 0xc9a0ff); // Violet
    fgHearts.position.z = 300;

    // Magical Golden Dust
    const dust = createParticleSystem(150, texDust, 15, 2000, 0.4, 0xffffff);

    scene.add(bgHearts, midHearts1, midHearts2, fgHearts, dust);

    // Mouse Parallax tracking
    let mx = 0,
      my = 0;
    let targetX = 0,
      targetY = 0;

    const onMouse = (e: MouseEvent) => {
      // Extremely subtle, luxurious parallax limits
      targetX = (e.clientX / window.innerWidth - 0.5) * 40;
      targetY = -(e.clientY / window.innerHeight - 0.5) * 40;
    };
    window.addEventListener("mousemove", onMouse);

    const onResize = () => {
      camera.aspect = w() / h();
      camera.updateProjectionMatrix();
      renderer.setSize(w(), h());
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    const clock = new THREE.Clock();

    const tick = () => {
      const t = clock.getElapsedTime();
      const delta = clock.getDelta();

      // Smooth camera parallax interpolation (Arc Browser smoothness)
      mx += (targetX - mx) * 0.02;
      my += (targetY - my) * 0.02;
      camera.position.x = mx;
      camera.position.y = my;
      camera.lookAt(0, 0, 0);

      // Layer 3: Distant Bokeh (Slow drift)
      bgHearts.rotation.y = t * 0.01;
      bgHearts.rotation.x = t * 0.005;

      // Layer 2: Midground (Elegant rotation)
      midHearts1.rotation.y = t * 0.015;
      midHearts2.rotation.y = -t * 0.012;
      midHearts2.position.y = Math.sin(t * 0.2) * 20;

      // Layer 1: Foreground (Very slow, majestic)
      fgHearts.rotation.y = t * 0.008;
      fgHearts.rotation.z = Math.sin(t * 0.1) * 0.05;

      // Magical Dust (Slowly drifting upwards)
      const dustPositions = dust.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 150; i++) {
        dustPositions[i * 3 + 1] += 0.2; // Move up slightly
        dustPositions[i * 3] += Math.sin(t * 0.5 + i) * 0.1; // Sway left/right
        if (dustPositions[i * 3 + 1] > 1000) {
          dustPositions[i * 3 + 1] = -1000; // Wrap around
        }
      }
      dust.geometry.attributes.position.needsUpdate = true;

      // Organic opacity pulsing for mid hearts
      const mat = midHearts1.material as THREE.PointsMaterial;
      mat.opacity = 0.2 + Math.sin(t * 0.5) * 0.05;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      texHeartSharp.dispose();
      texHeartBokeh.dispose();
      texDust.dispose();
      [bgHearts, midHearts1, midHearts2, fgHearts, dust].forEach((p) => {
        p.geometry.dispose();
        (p.material as THREE.Material).dispose();
      });
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <>
      {/* Protected content zone: Absolute negative z-index so it never touches UI */}
      <div
        ref={mountRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -10 }}
        aria-hidden
      />

      {/* Layer 1: Cinematic Warm Lighting Orbs (A24/Apple Event feel) */}
      <div
        className="fixed pointer-events-none rounded-full float-y"
        aria-hidden
        style={{
          top: "-5%",
          right: "-15%",
          width: "800px",
          height: "800px",
          background: "radial-gradient(circle, rgba(166,123,123,0.12) 0%, rgba(0,0,0,0) 70%)",
          zIndex: -11,
          animationDuration: "12s",
        }}
      />
      <div
        className="fixed pointer-events-none rounded-full float-y"
        aria-hidden
        style={{
          bottom: "-20%",
          left: "-10%",
          width: "900px",
          height: "900px",
          background: "radial-gradient(circle, rgba(45,10,10,0.2) 0%, rgba(0,0,0,0) 70%)",
          zIndex: -11,
          animationDuration: "15s",
          animationDelay: "-5s",
        }}
      />
      <div
        className="fixed pointer-events-none rounded-full float-y"
        aria-hidden
        style={{
          top: "35%",
          left: "20%",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, rgba(0,0,0,0) 70%)",
          zIndex: -11,
          animationDuration: "18s",
          animationDelay: "-2s",
        }}
      />
    </>
  );
}
