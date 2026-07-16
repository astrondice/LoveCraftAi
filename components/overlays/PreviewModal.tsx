'use client'

import { useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface PreviewModalProps {
  isOpen: boolean
  htmlContent: string
  onClose: () => void
  onDownload: () => void
}

export default function PreviewModal({
  isOpen,
  htmlContent,
  onClose,
  onDownload,
}: PreviewModalProps) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen && frameRef.current) {
      frameRef.current.srcdoc = htmlContent
      // Move focus to close button when modal opens
      setTimeout(() => closeButtonRef.current?.focus(), 100)
    }
    if (!isOpen && frameRef.current) {
      frameRef.current.srcdoc = ''
    }
  }, [isOpen, htmlContent])

  // Close on Escape key, trap focus
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    },
    [isOpen, onClose]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="prev-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Live preview of your love website"
          className="fixed inset-0 z-[1500] flex flex-col items-center p-5 overflow-y-auto"
          style={{
            background: 'rgba(0,0,0,0.94)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => {
            // Close on backdrop click (outside the inner box)
            if (e.target === e.currentTarget) onClose()
          }}
        >
          {/* Top bar */}
          <div className="w-full max-w-[940px] flex items-center justify-between mb-4">
            <h3
              className="font-serif font-light"
              style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.75)' }}
            >
              ✨ Live Preview
            </h3>
            <div className="flex gap-3">
              <motion.button
                className="btn btn-gold btn-sm"
                onClick={onDownload}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Download love website as ZIP"
              >
                ⬇️ Download
              </motion.button>
              <motion.button
                ref={closeButtonRef}
                className="btn btn-ghost btn-sm"
                onClick={onClose}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Close preview"
              >
                ✕ Close
              </motion.button>
            </div>
          </div>

          {/* iframe wrapper */}
          <motion.div
            className="w-full max-w-[940px] flex-1 overflow-hidden"
            style={{
              borderRadius: 18,
              border: '1px solid rgba(255,255,255,0.1)',
              minHeight: 480,
            }}
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
          >
            <iframe
              ref={frameRef}
              id="prev-frame"
              title="Love Site Preview"
              className="w-full border-none bg-black"
              style={{ height: '78vh' }}
              sandbox="allow-scripts allow-same-origin"
            />
          </motion.div>

          {/* Hint */}
          <p
            className="mt-4 text-[0.65rem] tracking-[0.15em] uppercase"
            style={{ color: 'rgba(255,255,255,0.18)' }}
            aria-hidden="true"
          >
            Press Esc to close · Click the site to experience it
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
