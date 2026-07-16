'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import dynamic from 'next/dynamic'

import { useGeneratorStore } from '@/store/useGeneratorStore'
import { buildLoveHTML } from '@/lib/buildLoveHTML'
import { downloadBlob } from '@/lib/fileHelpers'
import { slugify } from '@/lib/slugify'

import HeroSection from '@/components/hero/HeroSection'
import StepNav from '@/components/generator/StepNav'
import GlassCard from '@/components/generator/GlassCard'
import StepStory from '@/components/generator/steps/StepStory'
import StepUpload from '@/components/generator/steps/StepUpload'
import StepTheme from '@/components/generator/steps/StepTheme'
import StepCreate from '@/components/generator/steps/StepCreate'
import AnimatedOrbs from '@/components/orbs/AnimatedOrbs'
import GeneratingOverlay from '@/components/overlays/GeneratingOverlay'
import PreviewModal from '@/components/overlays/PreviewModal'
import Toast from '@/components/overlays/Toast'

// ── Dynamic (browser-only) ────────────────────────────────────────────────────

const ParticleCanvas = dynamic(() => import('@/components/canvas/ParticleCanvas'), {
  ssr: false,
})

const ThreeBackground = dynamic(() => import('@/components/canvas/ThreeBackground'), {
  ssr: false,
})

// ── Generate steps config ──────────────────────────────────────────────────────

const GEN_STEPS: [number, string][] = [
  [8, 'Summoning stardust…'],
  [20, 'Composing your love story…'],
  [35, 'Painting aurora skies…'],
  [50, 'Embedding your memories…'],
  [65, 'Animating cinematic scenes…'],
  [78, 'Weaving GSAP magic…'],
  [90, 'Polishing every frame…'],
  [100, 'Your love story is ready 💖'],
]

// ── Page variants ──────────────────────────────────────────────────────────────

const panelVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    y: dir * 16,
  }),
  center: {
    opacity: 1,
    y: 0,
  },
  exit: (dir: number) => ({
    opacity: 0,
    y: dir * -16,
  }),
}

// ══════════════════════════════════════════════════════════════════════════════
//  PAGE COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function Home() {
  const storeState = useGeneratorStore()
  const { step } = storeState

  // ── Overlay state ────────────────────────────────────────────────────────────
  const [generating, setGenerating] = useState(false)
  const [genProgress, setGenProgress] = useState(0)
  const [genStatus, setGenStatus] = useState('')

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')

  const [toast, setToast] = useState({ visible: false, message: '' })

  const prevStepRef = useRef(step)

  // Direction for step transition animation
  const direction = step > prevStepRef.current ? 1 : -1
  useEffect(() => {
    prevStepRef.current = step
  }, [step])

  // ── GSAP scroll-trigger for generator entrance ─────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      // Safety timeout: if ScrollTrigger never fires (element already in view
      // on load or Lenis not yet ready), force full visibility after 1.5s
      const safetyTimer = setTimeout(() => {
        ;['.step-nav-wrap', '.glass-card-wrap'].forEach((sel) => {
          const el = document.querySelector(sel) as HTMLElement | null
          if (el) {
            el.style.opacity = '1'
            el.style.transform = 'none'
          }
        })
      }, 1500)

      const onComplete = () => clearTimeout(safetyTimer)

      gsap.fromTo(
        '.step-nav-wrap',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          onComplete,
          scrollTrigger: {
            trigger: '#generator',
            start: 'top 90%',
            once: true,
            invalidateOnRefresh: true,
          },
        }
      )
      gsap.fromTo(
        '.glass-card-wrap',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          delay: 0.15,
          onComplete,
          scrollTrigger: {
            trigger: '#generator',
            start: 'top 90%',
            once: true,
            invalidateOnRefresh: true,
          },
        }
      )

      // If generator is already visible at init time, trigger immediately
      ScrollTrigger.refresh()
    }
    init().catch(console.error)
  }, [])


  // ── Show toast helper ──────────────────────────────────────────────────────
  const showToast = useCallback((message: string) => {
    setToast({ visible: true, message })
  }, [])

  // ── Open preview ───────────────────────────────────────────────────────────
  const handlePreview = useCallback(() => {
    const html = buildLoveHTML(useGeneratorStore.getState() as typeof storeState)
    setPreviewHtml(html)
    setPreviewOpen(true)
  }, [])

  // ── Generate + download ────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    setGenerating(true)
    setGenProgress(0)
    setGenStatus(GEN_STEPS[0][1])

    // Animate through steps
    await new Promise<void>((resolve) => {
      let i = 0
      const run = () => {
        if (i >= GEN_STEPS.length) {
          resolve()
          return
        }
        const [pct, text] = GEN_STEPS[i]
        setGenProgress(pct)
        setGenStatus(text)
        i++
        setTimeout(run, 280 + Math.random() * 170)
      }
      run()
    })

    // Small pause on "ready" message
    await new Promise((r) => setTimeout(r, 600))

    try {
      // Access store state outside of React render (safe pattern for callbacks)
      const state = useGeneratorStore.getState() as typeof storeState
      const html = buildLoveHTML(state)
      const filename = `lovecraft-${slugify(state.name1)}-${slugify(state.name2)}`

      // Use JSZip if available, else raw HTML
      const JSZip = await import('jszip').then((m) => m.default).catch(() => null)

      if (JSZip) {
        const zip = new JSZip()
        zip.file('index.html', html)
        zip.file(
          'README.md',
          `# LoveCraft AI\nOpen \`index.html\` in any browser with internet access.\n`
        )
        const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
        downloadBlob(blob, `${filename}.zip`)
      } else {
        downloadBlob(new Blob([html], { type: 'text/html' }), `${filename}.html`)
      }

      showToast('Download started! Open index.html in any browser 💝')
    } catch (err) {
      showToast(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setGenerating(false)
      setGenProgress(0)
      setGenStatus('')
    }
  }, [showToast])

  return (
    <>
      {/* ── Backgrounds ─────────────────────────────────────────────────────── */}
      <ParticleCanvas />
      <ThreeBackground />
      <AnimatedOrbs />

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <HeroSection onStart={() => {}} onPreview={handlePreview} />

      {/* ── Generator ───────────────────────────────────────────────────────── */}
      <section id="generator">
        {/* Step nav */}
        <div className="step-nav-wrap">
          <StepNav />
        </div>

        {/* Glass card */}
        <div className="glass-card-wrap">
          <GlassCard>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {step === 0 && <StepStory />}
                {step === 1 && <StepUpload />}
                {step === 2 && <StepTheme />}
                {step === 3 && (
                  <StepCreate onPreview={handlePreview} onGenerate={handleGenerate} />
                )}
              </motion.div>
            </AnimatePresence>
          </GlassCard>
        </div>
      </section>

      {/* ── Overlays ─────────────────────────────────────────────────────────── */}
      <GeneratingOverlay
        isOpen={generating}
        progress={genProgress}
        statusText={genStatus}
      />

      <PreviewModal
        isOpen={previewOpen}
        htmlContent={previewHtml}
        onClose={() => setPreviewOpen(false)}
        onDownload={() => {
          setPreviewOpen(false)
          handleGenerate()
        }}
      />

      <Toast
        message={toast.message}
        isVisible={toast.visible}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </>
  )
}
