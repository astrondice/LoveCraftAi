'use client'

import { useEffect, useRef } from 'react'

const PARTICLE_COLS = ['255,255,255', '232,85,122', '201,169,110', '128,64,224']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  a: number
  col: string
  tw: number
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    let W = 0
    let H = 0
    let animId = 0
    let t = 0
    const mouse = { x: -999, y: -999 }

    const particles: Particle[] = []

    const resize = () => {
      W = cv.width = window.innerWidth
      H = cv.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        mouse.x = e.touches[0].clientX
        mouse.y = e.touches[0].clientY
      }
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    // Spawn particles
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * 2,
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0003,
        vy: -(Math.random() * 0.0004 + 0.0001),
        r: Math.random() * 1.8 + 0.3,
        a: Math.random() * 0.7 + 0.1,
        col: PARTICLE_COLS[Math.floor(Math.random() * PARTICLE_COLS.length)],
        tw: Math.random() * Math.PI * 2,
      })
    }

    function aurora() {
      // Three animated aurora orbs
      const g1 = ctx!.createRadialGradient(
        W * 0.75 + Math.sin(t * 0.4) * 80, H * 0.15 + Math.cos(t * 0.3) * 40, 0,
        W * 0.75, H * 0.15, W * 0.7
      )
      g1.addColorStop(0, 'rgba(180,60,120,0.08)')
      g1.addColorStop(1, 'transparent')
      ctx!.fillStyle = g1
      ctx!.fillRect(0, 0, W, H)

      const g2 = ctx!.createRadialGradient(
        W * 0.1 + Math.cos(t * 0.25) * 60, H * 0.65 + Math.sin(t * 0.2) * 50, 0,
        W * 0.1, H * 0.65, W * 0.55
      )
      g2.addColorStop(0, 'rgba(80,30,160,0.07)')
      g2.addColorStop(1, 'transparent')
      ctx!.fillStyle = g2
      ctx!.fillRect(0, 0, W, H)

      const g3 = ctx!.createRadialGradient(
        W * 0.5 + Math.sin(t * 0.35) * 100, H * 0.5, 0,
        W * 0.5, H * 0.5, W * 0.4
      )
      g3.addColorStop(0, 'rgba(232,85,122,0.04)')
      g3.addColorStop(1, 'transparent')
      ctx!.fillStyle = g3
      ctx!.fillRect(0, 0, W, H)
    }

    function loop() {
      animId = requestAnimationFrame(loop)
      t += 0.008
      ctx!.clearRect(0, 0, W, H)
      aurora()

      for (const p of particles) {
        p.tw += 0.04
        // Mouse repel
        const dx = p.x * W - mouse.x
        const dy = p.y * H - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 100) {
          p.vx += (dx / dist) * 0.00008
          p.vy += (dy / dist) * 0.00008
        }
        p.x += p.vx
        p.y += p.vy
        if (p.y * H < -10) { p.y = 1.02; p.x = Math.random() }
        if (p.x < -0.05) p.x = 1.05
        if (p.x > 1.05) p.x = -0.05

        const alpha = p.a * (0.5 + 0.5 * Math.abs(Math.sin(p.tw)))
        ctx!.beginPath()
        ctx!.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${p.col},${alpha})`
        ctx!.fill()
      }
    }

    loop()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      id="bg-canvas"
      className="fixed inset-0 z-0 pointer-events-none w-full h-full"
      aria-hidden="true"
    />
  )
}
