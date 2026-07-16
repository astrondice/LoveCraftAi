'use client'

import { type ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
}

export default function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div
      className={`relative rounded-3xl overflow-hidden ${className}`}
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.11)',
        padding: 'clamp(1.5rem, 4vw, 2.8rem)',
        backdropFilter: 'blur(28px) saturate(160%)',
        WebkitBackdropFilter: 'blur(28px) saturate(160%)',
      }}
    >
      {/* Top highlight line */}
      <div
        className="absolute top-0 left-[10%] right-[10%] h-px pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
        }}
      />

      {/* Rose ambient orb — top right */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 360,
          height: 360,
          background: 'rgba(232,85,122,0.10)',
          top: -150,
          right: -80,
          filter: 'blur(80px)',
          opacity: 0.6,
        }}
      />

      {/* Violet ambient orb — bottom left */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 280,
          height: 280,
          background: 'rgba(100,40,180,0.09)',
          bottom: -100,
          left: -60,
          filter: 'blur(80px)',
          opacity: 0.6,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
