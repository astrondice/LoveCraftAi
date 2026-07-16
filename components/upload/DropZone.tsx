'use client'

import { type DragEvent, type MouseEvent } from 'react'
import { motion } from 'framer-motion'

interface DropZoneProps {
  icon: string
  title: string
  hint: string
  hint2: string
  isDragging?: boolean
  statusText?: string
  borderColor?: string
  ariaLabel?: string
  onDragOver?: (e: DragEvent<HTMLDivElement>) => void
  onDragLeave?: (e: DragEvent<HTMLDivElement>) => void
  onDrop?: (e: DragEvent<HTMLDivElement>) => void
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
}

export default function DropZone({
  icon,
  title,
  hint,
  hint2,
  isDragging = false,
  statusText,
  borderColor,
  ariaLabel,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
}: DropZoneProps) {
  return (
    <motion.div
      className="uz"
      style={
        borderColor
          ? { borderColor, background: 'rgba(201,169,110,0.03)' }
          : isDragging
          ? {
              borderColor: 'rgba(232,85,122,0.5)',
              background: 'rgba(232,85,122,0.04)',
            }
          : {}
      }
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel ?? `Upload ${title}`}
      aria-pressed={!!statusText}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(e as unknown as MouseEvent<HTMLDivElement>)
        }
      }}
    >
      <span className="uz-icon" aria-hidden="true">{icon}</span>
      <div className="uz-title">{title}</div>
      <div className="uz-hint">
        {hint}
        <br />
        {hint2}
      </div>
      {statusText && (
        <motion.span
          className="uz-done"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          aria-live="polite"
        >
          {statusText}
        </motion.span>
      )}
    </motion.div>
  )
}
