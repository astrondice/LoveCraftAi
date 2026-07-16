'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// eslint-disable-next-line
type LenisInstance = any

const LenisContext = createContext<LenisInstance | null>(null)

export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<LenisInstance | null>(null)

  useEffect(() => {
    let instance: LenisInstance
    let tickQueue: ((time: number) => void) | null = null

    const init = async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])

      gsap.registerPlugin(ScrollTrigger)

      instance = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical' as const,
        gestureOrientation: 'vertical' as const,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      })

      // Sync Lenis scroll events to GSAP ScrollTrigger
      instance.on('scroll', ScrollTrigger.update)

      // Drive Lenis through GSAP's ticker — perfect frame sync
      tickQueue = (time: number) => {
        if (instance) instance.raf(time * 1000)
      }
      gsap.ticker.add(tickQueue)
      gsap.ticker.lagSmoothing(0)

      setLenis(instance)
    }

    init().catch(console.error)

    return () => {
      if (tickQueue) {
        import('gsap').then(({ gsap }) => {
          if (tickQueue) gsap.ticker.remove(tickQueue)
        })
      }
      if (instance) {
        instance.destroy()
      }
    }
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}

export function useLenisContext(): LenisInstance | null {
  return useContext(LenisContext)
}
