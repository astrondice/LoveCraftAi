import { motion, useSpring } from "framer-motion";
import { useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "gold";

type Props = {
  variant?: Variant;
  children: ReactNode;
} & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | "ref"
  | "onDrag"
  | "onDragEnd"
  | "onDragStart"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
>;

const variants: Record<Variant, string> = {
  primary:
    "bg-ivory text-charcoal hover:shadow-[0_0_28px_rgba(250,249,246,0.35)] border border-ivory",
  ghost: "bg-transparent text-ivory border border-ivory/30 hover:border-ivory hover:bg-ivory/5",
  gold: "text-charcoal border border-transparent bg-gradient-to-r from-[#e8c060] via-[#d4af37] to-[#a67b7b] hover:shadow-[0_0_28px_rgba(212,175,55,0.5)]",
};

export function MagneticButton({ variant = "primary", className, children, ...rest }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useSpring(0, { stiffness: 150, damping: 15, mass: 0.3 });
  const y = useSpring(0, { stiffness: 150, damping: 15, mass: 0.3 });

  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.4);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x, y }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 label-caps transition-shadow duration-300",
        variants[variant],
        className,
      )}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </motion.button>
  );
}
