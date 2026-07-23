import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <img
      src="/branding/logo.png"
      alt="LoveCraft AI"
      style={props.style}
      className={cn("h-[44px] w-auto max-w-full object-contain object-left", className)}
      {...props}
    />
  );
}
