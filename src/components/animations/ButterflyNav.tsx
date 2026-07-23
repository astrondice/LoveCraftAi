import { useEffect, useRef, useState } from "react";

type Props = { targets: string[] };

/**
 * A butterfly that flies around the page between named section ids.
 * Auto-hops every few seconds; clicking it advances to the next section
 * (both scrolling into view and flying there).
 */
export function ButterflyNav({ targets }: Props) {
  const [idx, setIdx] = useState(0);
  const [pos, setPos] = useState({ x: 80, y: 120 });
  const [flip, setFlip] = useState(false);
  const timerRef = useRef<number | null>(null);

  const goTo = (nextIdx: number) => {
    const id = targets[nextIdx % targets.length];
    const el = document.getElementById(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // land near top-right of the section, jittered
    const x = Math.min(
      window.innerWidth - 120,
      Math.max(40, rect.right - 100 + (Math.random() - 0.5) * 120),
    );
    const y = Math.max(90, rect.top + 80 + (Math.random() - 0.5) * 60);
    setFlip(x < pos.x);
    setPos({ x, y });
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setIdx(nextIdx % targets.length);
  };

  useEffect(() => {
    // Initial hop after mount
    const t0 = window.setTimeout(() => goTo(0), 1200);
    return () => window.clearTimeout(t0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Auto-cycle
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => goTo(idx + 1), 6500);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  return (
    <button
      type="button"
      onClick={() => goTo(idx + 1)}
      aria-label="Fly to next section"
      className="fixed z-40 pointer-events-auto select-none"
      style={{
        left: 0,
        top: 0,
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scaleX(${flip ? -1 : 1})`,
        transition: "transform 2.4s cubic-bezier(.42,.02,.28,1)",
        filter: "drop-shadow(0 8px 18px rgba(232,120,150,.45))",
        background: "transparent",
        border: 0,
        padding: 0,
        cursor: "pointer",
        animation: "bfly-float 3.6s ease-in-out infinite",
      }}
    >
      <svg width="72" height="60" viewBox="0 0 120 100" aria-hidden>
        <defs>
          <radialGradient id="bfly-wing" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#ffe6d0" />
            <stop offset="45%" stopColor="#f7a6c1" />
            <stop offset="100%" stopColor="#7a2c4e" />
          </radialGradient>
          <radialGradient id="bfly-wing2" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#fff5c9" />
            <stop offset="45%" stopColor="#d8a25a" />
            <stop offset="100%" stopColor="#5a2a0a" />
          </radialGradient>
        </defs>

        <g
          style={{
            transformOrigin: "60px 50px",
            animation: "bfly-flap 260ms ease-in-out infinite",
          }}
        >
          {/* Left upper wing */}
          <path
            d="M60 50 C 20 10, 0 30, 12 55 C 22 74, 46 68, 60 50 Z"
            fill="url(#bfly-wing)"
            opacity="0.95"
          />
          {/* Left lower wing */}
          <path
            d="M60 52 C 30 68, 18 90, 40 92 C 54 93, 60 78, 60 52 Z"
            fill="url(#bfly-wing2)"
            opacity="0.9"
          />
        </g>

        <g
          style={{
            transformOrigin: "60px 50px",
            animation: "bfly-flap-r 260ms ease-in-out infinite",
          }}
        >
          {/* Right upper wing */}
          <path
            d="M60 50 C 100 10, 120 30, 108 55 C 98 74, 74 68, 60 50 Z"
            fill="url(#bfly-wing)"
            opacity="0.95"
          />
          {/* Right lower wing */}
          <path
            d="M60 52 C 90 68, 102 90, 80 92 C 66 93, 60 78, 60 52 Z"
            fill="url(#bfly-wing2)"
            opacity="0.9"
          />
        </g>

        {/* Body */}
        <ellipse cx="60" cy="60" rx="3.4" ry="20" fill="#2a1616" />
        {/* Antennae */}
        <path
          d="M60 40 C 55 30, 50 24, 46 22"
          stroke="#2a1616"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M60 40 C 65 30, 70 24, 74 22"
          stroke="#2a1616"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="46" cy="22" r="1.6" fill="#f7a6c1" />
        <circle cx="74" cy="22" r="1.6" fill="#f7a6c1" />
      </svg>

      <style>{`
        @keyframes bfly-flap {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(65deg); }
        }
        @keyframes bfly-flap-r {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(-65deg); }
        }
        @keyframes bfly-float {
          0%, 100% { margin-top: 0px; }
          50% { margin-top: -14px; }
        }
      `}</style>
    </button>
  );
}
