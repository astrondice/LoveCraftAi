'use client'

import { useEffect } from 'react'

export default function AnimatedOrbs() {
  useEffect(() => {
    const initOrbs = async () => {
      const { gsap } = await import('gsap')

      // Orb 1 — rose top-right
      gsap.to('#orb1', {
        opacity: 1,
        x: -30,
        y: 20,
        duration: 2,
        ease: 'power2.out',
        onComplete() {
          gsap.to('#orb1', {
            x: '+=40',
            y: '+=30',
            duration: 6,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          })
        },
      })

      // Orb 2 — violet bottom-left
      gsap.to('#orb2', {
        opacity: 1,
        duration: 2.5,
        delay: 0.4,
        ease: 'power2.out',
        onComplete() {
          gsap.to('#orb2', {
            x: '+=50',
            y: '-=40',
            duration: 7,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          })
        },
      })

      // Orb 3 — gold middle-right
      gsap.to('#orb3', {
        opacity: 1,
        duration: 2,
        delay: 0.8,
        ease: 'power2.out',
        onComplete() {
          gsap.to('#orb3', {
            x: '-=40',
            y: '+=50',
            duration: 5.5,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          })
        },
      })
    }

    initOrbs().catch(console.error)
  }, [])

  return (
    <>
      {/* Rose orb — top right */}
      <div
        id="orb1"
        className="fixed pointer-events-none z-0 rounded-full opacity-0"
        style={{
          width: 500,
          height: 500,
          background:
            'radial-gradient(circle, rgba(232,85,122,0.18) 0%, transparent 70%)',
          top: -100,
          right: -100,
          filter: 'blur(80px)',
        }}
      />
      {/* Violet orb — bottom left */}
      <div
        id="orb2"
        className="fixed pointer-events-none z-0 rounded-full opacity-0"
        style={{
          width: 400,
          height: 400,
          background:
            'radial-gradient(circle, rgba(112,48,192,0.15) 0%, transparent 70%)',
          bottom: '10%',
          left: -80,
          filter: 'blur(80px)',
        }}
      />
      {/* Gold orb — middle right */}
      <div
        id="orb3"
        className="fixed pointer-events-none z-0 rounded-full opacity-0"
        style={{
          width: 300,
          height: 300,
          background:
            'radial-gradient(circle, rgba(201,169,110,0.12) 0%, transparent 70%)',
          top: '40%',
          right: '5%',
          filter: 'blur(80px)',
        }}
      />
    </>
  )
}
