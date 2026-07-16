'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGeneratorStore } from '@/store/useGeneratorStore'

export default function PhotoStrip() {
  const { photos, removePhoto } = useGeneratorStore()

  return (
    <div id="photo-strip" className="flex flex-wrap gap-2 mt-4">
      <AnimatePresence>
        {photos.map((photo, i) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.4, rotate: 8 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 20,
              delay: i * 0.03,
            }}
            className="relative group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.dataUrl}
              alt={photo.name}
              className="pt"
              title={photo.name}
            />
            {/* Remove button on hover */}
            <motion.button
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[0.6rem] font-medium"
              style={{
                background: 'rgba(232,85,122,0.9)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
              initial={{ opacity: 0, scale: 0 }}
              whileHover={{ scale: 1.15 }}
              onClick={(e) => {
                e.stopPropagation()
                removePhoto(photo.id)
              }}
              aria-label={`Remove ${photo.name}`}
            >
              ✕
            </motion.button>

            {/* Hover overlay */}
            <motion.div
              className="absolute inset-0 rounded-[9px] flex items-center justify-center"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              style={{ background: 'rgba(0,0,0,0.35)' }}
            >
              <span className="text-[0.6rem] text-white/70 text-center px-1 leading-tight">
                {photo.name.slice(0, 16)}
              </span>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
