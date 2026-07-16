'use client'

import { motion } from 'framer-motion'
import { useGeneratorStore } from '@/store/useGeneratorStore'

const STEPS = [
  { n: '01', label: 'Story' },
  { n: '02', label: 'Upload' },
  { n: '03', label: 'Theme' },
  { n: '04', label: 'Create' },
]

export default function StepNav() {
  const { step: current, gotoStep } = useGeneratorStore()

  return (
    <nav
      className="flex items-center justify-center mb-12 pt-2"
      aria-label="Generator steps"
    >
      {STEPS.map((s, i) => {
        const isActive = i === current
        const isDone = i < current

        return (
          <div key={s.n} className="flex items-center">
            {/* Step item */}
            <button
              onClick={() => gotoStep(i)}
              className="flex flex-col items-center gap-[0.45rem] px-5 cursor-pointer group"
              aria-current={isActive ? 'step' : undefined}
              aria-label={`Step ${s.n}: ${s.label}`}
            >
              {/* Circle */}
              <motion.div
                className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-[0.72rem] transition-all duration-300"
                animate={
                  isActive
                    ? {
                        borderColor: '#e8557a',
                        backgroundColor: 'rgba(232,85,122,0.15)',
                        color: '#e8557a',
                        boxShadow: '0 0 20px rgba(232,85,122,0.35)',
                      }
                    : isDone
                    ? {
                        borderColor: '#c9a96e',
                        backgroundColor: 'rgba(201,169,110,0.15)',
                        color: '#c9a96e',
                        boxShadow: 'none',
                      }
                    : {
                        borderColor: 'rgba(255,255,255,0.18)',
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        color: 'rgba(255,255,255,0.42)',
                        boxShadow: 'none',
                      }
                }
                style={{ border: '1.5px solid' }}
                transition={{ duration: 0.4 }}
              >
                {isDone ? '✓' : s.n}
              </motion.div>

              {/* Label */}
              <span
                className="text-[0.6rem] tracking-[0.14em] uppercase whitespace-nowrap transition-colors duration-300"
                style={{
                  color: isActive
                    ? 'rgba(255,255,255,0.7)'
                    : 'rgba(255,255,255,0.42)',
                }}
              >
                {s.label}
              </span>
            </button>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div
                className="h-px max-w-[50px] flex-1 transition-all duration-500"
                style={{
                  background:
                    i < current
                      ? 'linear-gradient(90deg, rgba(201,169,110,0.4), rgba(201,169,110,0.2))'
                      : 'rgba(255,255,255,0.08)',
                }}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
