import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function GlassCard({ className, children, ...rest }: Props) {
  return (
    <div className={cn("glass-panel rounded-2xl p-6 md:p-8", className)} {...rest}>
      {children}
    </div>
  );
}
