'use client'

import { useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface ToastProps {
  message: string
  isVisible: boolean
  onHide: () => void
}

export default function Toast({ message, isVisible, onHide }: ToastProps) {
  const stableOnHide = useCallback(onHide, [onHide])

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(stableOnHide, 3200)
      return () => clearTimeout(timer)
    }
  }, [isVisible, stableOnHide])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="toast"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] whitespace-nowrap text-white text-[0.83rem] rounded-full px-7 py-3 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #e8557a, #c03060)',
            boxShadow: '0 6px 30px rgba(232,85,122,0.4)',
            maxWidth: 'calc(100vw - 2rem)',
            whiteSpace: 'normal',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={stableOnHide}
          title="Click to dismiss"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
