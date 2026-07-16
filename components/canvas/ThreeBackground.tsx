'use client'

import { useEffect, useRef } from 'react'

// Rose, violet, gold, white — matching the LoveCraft palette
const PALETTE = ['#e8557a', '#c060a0', '#7030d0', '#c9a96e', '#ffffff', '#ffffff']

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // eslint-disable-next-line
    let THREE: any
    let renderer: any
    let animId: number
    let cleanup: (() => void) | undefined

    const init = async () => {
      THREE = await import('three')

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )
      camera.position.z = 14

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor(0x000000, 0)
      mount.appendChild(renderer.domElement)

      // ── Particle system ─────────────────────────────────────────────────
      const COUNT = 3500
      const positions = new Float32Array(COUNT * 3)
      const colors = new Float32Array(COUNT * 3)

      const palette = PALETTE.map((hex) => new THREE.Color(hex))

      for (let i = 0; i < COUNT; i++) {
        // Spherical shell distribution
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const radius = 9 + Math.random() * 7

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        positions[i * 3 + 2] = radius * Math.cos(phi)

        const color = palette[Math.floor(Math.random() * palette.length)]
        colors[i * 3] = color.r
        colors[i * 3 + 1] = color.g
        colors[i * 3 + 2] = color.b
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      // Create a heart shape canvas texture dynamically for circular/heart shape particles
      const pCanvas = document.createElement('canvas')
      pCanvas.width = 64
      pCanvas.height = 64
      const pCtx = pCanvas.getContext('2d')
      if (pCtx) {
        pCtx.clearRect(0, 0, 64, 64)
        pCtx.fillStyle = '#ffffff'
        pCtx.beginPath()
        // Standard bezier curve heart shape
        pCtx.moveTo(32, 20)
        pCtx.bezierCurveTo(32, 14, 24, 6, 16, 6)
        pCtx.bezierCurveTo(4, 6, 4, 20, 4, 20)
        pCtx.bezierCurveTo(4, 34, 18, 48, 32, 58)
        pCtx.bezierCurveTo(46, 48, 60, 34, 60, 20)
        pCtx.bezierCurveTo(60, 20, 60, 6, 48, 6)
        pCtx.bezierCurveTo(40, 6, 32, 14, 32, 20)
        pCtx.closePath()
        pCtx.fill()
      }
      const pTexture = new THREE.CanvasTexture(pCanvas)

      const material = new THREE.PointsMaterial({
        size: 0.22,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        map: pTexture,
      })

      const particles = new THREE.Points(geometry, material)
      scene.add(particles)

      // ── Mouse tracking with lerp ────────────────────────────────────────
      const mouse = { x: 0, y: 0, tx: 0, ty: 0 }

      const onMouseMove = (e: MouseEvent) => {
        mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2
        mouse.ty = -(e.clientY / window.innerHeight - 0.5) * 2
      }
      window.addEventListener('mousemove', onMouseMove, { passive: true })

      // ── Resize ─────────────────────────────────────────────────────────
      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      window.addEventListener('resize', onResize, { passive: true })

      // ── Animation loop ──────────────────────────────────────────────────
      let t = 0
      const animate = () => {
        animId = requestAnimationFrame(animate)
        t += 0.002

        // Smooth mouse follow
        mouse.x += (mouse.tx - mouse.x) * 0.04
        mouse.y += (mouse.ty - mouse.y) * 0.04

        particles.rotation.x = t * 0.04 + mouse.y * 0.12
        particles.rotation.y = t * 0.06 + mouse.x * 0.12

        // Breathe opacity
        material.opacity = 0.45 + 0.18 * Math.sin(t * 0.5)

        renderer.render(scene, camera)
      }
      animate()

      cleanup = () => {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('resize', onResize)
        geometry.dispose()
        material.dispose()
      }
    }

    init().catch(console.error)

    return () => {
      cancelAnimationFrame(animId)
      cleanup?.()
      if (renderer && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
        renderer.dispose()
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-[2] pointer-events-none"
      aria-hidden="true"
    />
  )
}
