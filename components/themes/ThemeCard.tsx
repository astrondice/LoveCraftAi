'use client'

import { motion } from 'framer-motion'
import type { ThemeConfig } from '@/types'

interface ThemeCardProps {
  theme: ThemeConfig
  isSelected: boolean
  onSelect: () => void
}

export default function ThemeCard({ theme, isSelected, onSelect }: ThemeCardProps) {
  return (
    <motion.div
      className={`tc ${theme.cardClass}`}
      onClick={onSelect}
      whileHover={{ y: -4, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      animate={
        isSelected
          ? {
              borderColor: '#e8557a',
              boxShadow:
                '0 0 0 4px rgba(232,85,122,0.12), 0 10px 40px rgba(232,85,122,0.2)',
            }
          : {
              borderColor: 'transparent',
              boxShadow: 'none',
            }
      }
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      role="radio"
      aria-checked={isSelected}
      aria-label={`${theme.name}: ${theme.vibes}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      {/* Checkmark */}
      <motion.div
        className="chk"
        aria-hidden="true"
        initial={false}
        animate={
          isSelected ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }
        }
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        ✓
      </motion.div>

      <span className="ti" aria-hidden="true">{theme.icon}</span>
      <div className="tn">{theme.name}</div>
      <div className="tv">{theme.vibes}</div>
    </motion.div>
  )
}
