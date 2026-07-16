'use client'

import { AnimatePresence, motion } from 'framer-motion'

export default function GeneratingOverlay({
  isOpen,
  progress,
  statusText,
}: {
  isOpen: boolean
  progress: number
  statusText: string
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="gen-ov"
          className="fixed inset-0 z-[2000] flex flex-col items-center justify-center gap-5"
          style={{
            background: 'rgba(4,2,14,0.97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Pulsing rings */}
          <div className="gr">
            {[
              { size: 100, color: 'rgba(232,85,122,0.3)', delay: 0 },
              { size: 72, color: 'rgba(201,169,110,0.4)', delay: 0.3 },
              { size: 44, color: 'rgba(128,64,224,0.5)', delay: 0.6 },
            ].map(({ size, color, delay }) => (
              <motion.div
                key={size}
                className="absolute rounded-full"
                style={{
                  width: size,
                  height: size,
                  border: `1px solid ${color}`,
                }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.7, 0.3, 0.7] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay,
                  ease: 'easeInOut',
                }}
              />
            ))}

            {/* Heart */}
            <motion.div
              className="text-[1.8rem] relative z-10"
              animate={{ scale: [1, 1.18, 1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            >
              💝
            </motion.div>
          </div>

          {/* Title */}
          <p
            className="font-serif font-light"
            style={{
              fontSize: 'clamp(1.4rem, 4vw, 2rem)',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            Crafting your experience…
          </p>

          {/* Status text */}
          <AnimatePresence mode="wait">
            <motion.p
              key={statusText}
              className="text-[0.75rem] tracking-[0.15em] uppercase min-h-[1.2em]"
              style={{ color: 'rgba(255,255,255,0.42)' }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              {statusText}
            </motion.p>
          </AnimatePresence>

          {/* Progress track */}
          <div
            className="rounded-full overflow-hidden"
            style={{
              width: 'min(300px, 80vw)',
              height: 2,
              background: 'rgba(255,255,255,0.08)',
            }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #e8557a, #c9a96e)',
                boxShadow: '0 0 8px #e8557a',
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          {/* Percentage */}
          <p
            className="text-[0.68rem] tracking-[0.1em]"
            style={{ color: 'rgba(255,255,255,0.22)' }}
          >
            {progress}%
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
