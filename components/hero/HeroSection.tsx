'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface HeroSectionProps {
  onStart: () => void
  onPreview: () => void
}

export default function HeroSection({ onStart, onPreview }: HeroSectionProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const initGSAP = async () => {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      const { ScrollToPlugin } = await import('gsap/ScrollToPlugin')
      gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

      // Staggered cinematic entrance
      const tl = gsap.timeline({ delay: 0.2 })
      tl.from('#hb',  { opacity: 0, y: 20, duration: 0.9, ease: 'power3.out' })
        .from('#he',  { opacity: 0, y: 20, duration: 1.0, ease: 'power3.out' }, 0.25)
        .from('#ht',  { opacity: 0, y: 30, duration: 1.3, ease: 'power4.out' }, 0.45)
        .from('#hs',  { opacity: 0, y: 20, duration: 1.0, ease: 'power3.out' }, 0.8)
        .from('#hb2', { opacity: 0, y: 18, duration: 0.9, ease: 'back.out(1.7)' }, 1.1)
        .from('#hst', { opacity: 0, y: 16, duration: 0.9, ease: 'power3.out' }, 1.35)
        .from('#sc',  { opacity: 0, duration: 0.8, ease: 'power2.out' }, 1.7)

      // Safety fallback to prevent permanent invisibility on slow systems
      setTimeout(() => {
        const ids = ['hb', 'he', 'ht', 'hs', 'hb2', 'hst', 'sc']
        ids.forEach((id) => {
          const el = document.getElementById(id)
          if (el) {
            el.style.opacity = '1'
            el.style.transform = 'none'
          }
        })
      }, 3500)

      // Title gradient shimmer loop
      gsap.to('#ht', {
        backgroundPosition: '200% 200%',
        duration: 8,
        ease: 'none',
        repeat: -1,
        yoyo: true,
      })
    }

    initGSAP().catch(console.error)
  }, [])

  const scrollToGenerator = () => {
    const el = document.getElementById('generator')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
    onStart()
  }

  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center text-center px-6 py-8"
    >
      {/* Badge */}
      <div
        id="hb"
        role="presentation"
        className="inline-flex items-center gap-2 px-4 py-1.5 mb-7 rounded-full text-[0.68rem] tracking-[0.22em] uppercase"
        style={{
          border: '1px solid rgba(201,169,110,0.35)',
          color: '#c9a96e',
          background: 'rgba(201,169,110,0.07)',
        }}
      >
        ✦ LoveCraft AI&nbsp;·&nbsp; Cinematic Edition
      </div>

      {/* Eyebrow */}
      <p
        id="he"
        className="font-serif text-[clamp(1rem,2.5vw,1.3rem)] font-light italic mb-2 tracking-[0.06em]"
        style={{ color: 'rgba(255,255,255,0.42)' }}
      >
        The world&rsquo;s most beautiful
      </p>

      {/* Title */}
      <h1
        id="ht"
        ref={titleRef}
        className="font-serif font-light leading-none tracking-[-0.02em] mb-6"
        style={{
          fontSize: 'clamp(2.8rem, 8vw, 7rem)',
          background:
            'linear-gradient(140deg, #fff 0%, #f5d0dc 35%, #c9a96e 70%, #fff 100%)',
          backgroundSize: '300% 300%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Love Website
        <br />
        Generator
      </h1>

      {/* Subtitle */}
      <p
        id="hs"
        className="max-w-[480px] text-[clamp(0.88rem,1.8vw,1rem)] leading-[1.8] mb-10"
        style={{ color: 'rgba(255,255,255,0.42)' }}
      >
        Transform your photos, music &amp; memories into a cinematic love experience — a short
        romantic film that lives in a browser tab, forever.
      </p>

      {/* CTA Buttons */}
      <div id="hb2" className="flex gap-4 justify-center flex-wrap">
        <motion.button
          onClick={scrollToGenerator}
          className="btn btn-primary"
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          aria-label="Start creating your love website — it's free"
        >
          ❤️&nbsp; Start Creating — Free
        </motion.button>

        <motion.button
          onClick={onPreview}
          className="btn btn-ghost"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          aria-label="See a preview of what you can create"
        >
          ✦&nbsp; See a Preview
        </motion.button>
      </div>

      {/* Stats row */}
      <div id="hst" className="flex gap-8 justify-center mt-10" aria-label="Features at a glance">
        {[
          { n: '6', l: 'Cinematic Themes' },
          { n: '∞', l: 'Photos & Music' },
          { n: 'ZIP', l: 'Instant Download' },
        ].map(({ n, l }) => (
          <div key={l} className="text-center">
            <div
              className="font-serif text-[1.9rem] font-light leading-none"
              aria-label={`${n} ${l}`}
              style={{
                background: 'linear-gradient(135deg, #fff, #e8557a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {n}
            </div>
            <div
              className="text-[0.6rem] tracking-[0.18em] uppercase mt-1"
              aria-hidden="true"
              style={{ color: 'rgba(255,255,255,0.42)' }}
            >
              {l}
            </div>
          </div>
        ))}
      </div>

      {/* Scroll cue */}
      <div
        id="sc"
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div
          className="relative"
          style={{
            width: 20,
            height: 32,
            border: '1.5px solid rgba(255,255,255,0.25)',
            borderRadius: 10,
          }}
        >
          <span
            className="absolute left-1/2 top-[5px] -translate-x-1/2 block rounded-full animate-scroll-dot"
            style={{ width: 3, height: 6, background: 'rgba(255,255,255,0.5)' }}
          />
        </div>
        <span
          className="text-[0.6rem] tracking-[0.25em] uppercase"
          style={{ color: 'rgba(255,255,255,0.22)' }}
        >
          Scroll to begin
        </span>
      </div>
    </section>
  )
}
