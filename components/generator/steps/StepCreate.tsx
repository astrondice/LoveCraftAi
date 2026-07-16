'use client'

import { motion } from 'framer-motion'
import { useGeneratorStore } from '@/store/useGeneratorStore'
import { THEMES } from '@/lib/themeColors'

const FEATURE_PILLS = [
  '✦ Cinematic Opening Curtain',
  '✦ GSAP Scroll Animations',
  '✦ Starfield Background',
  '✦ Aurora Light Effects',
  '✦ Photo Reveal Gallery',
  '✦ Animated Love Letter',
  '✦ Memory Timeline',
  '✦ Floating Quotes',
  '✦ Video Cinematic Scene',
  '✦ Parallax Photo Spotlight',
  '✦ Words in the Dark',
  '✦ Countdown Timer',
  '✦ Note to the Future',
  '✦ Hearts Rain Finale',
  '✦ Scroll Progress Bar',
  '✦ Mobile Responsive',
]

interface StepCreateProps {
  onPreview: () => void
  onGenerate: () => void
}

export default function StepCreate({ onPreview, onGenerate }: StepCreateProps) {
  const { name1, name2, specialDate, duration, photos, music, video, theme, prevStep } =
    useGeneratorStore()

  const T = THEMES[theme]

  // Format date for display
  const formattedDate = specialDate
    ? new Date(specialDate + 'T00:00:00').toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not set'

  const summaryItems = [
    { icon: '💑', label: 'Names', value: `${name1 || '—'} & ${name2 || '—'}` },
    { icon: '📅', label: 'Date', value: formattedDate },
    { icon: '⏳', label: 'Together', value: duration || 'Not set' },
    { icon: '🎨', label: 'Theme', value: `${T.icon} ${T.name}` },
    {
      icon: '🖼️',
      label: 'Photos',
      value: `${photos.length} photo${photos.length !== 1 ? 's' : ''}`,
    },
    {
      icon: '🎵',
      label: 'Music',
      value: music ? music.name.replace(/\.[^.]+$/, '').slice(0, 26) : 'None',
    },
    { icon: '🎬', label: 'Video', value: video ? 'Added ✓' : 'None' },
  ]

  return (
    <div>
      <div className="sp-eye" aria-hidden="true">Step 04 — The Moment</div>
      <h2 className="sp-title">Ready to Make Magic</h2>
      <p className="sp-desc">Your complete cinematic love website is one click away.</p>

      {/* Summary grid */}
      <section aria-label="Your love story summary">
        <div className="sum-grid">
          {summaryItems.map((item, i) => (
            <motion.div
              key={item.label}
              className="si"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
            >
              <span className="si-ico" aria-hidden="true">{item.icon}</span>
              <div>
                <div className="si-lbl">{item.label}</div>
                <div className="si-val">{item.value}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature pills */}
      <div className="f-pills" aria-label="Included features" role="list">
        {FEATURE_PILLS.map((pill) => (
          <span key={pill} className="fp" role="listitem">
            {pill}
          </span>
        ))}
      </div>

      <div className="btn-row" style={{ justifyContent: 'center', gap: '0.9rem' }}>
        <button className="btn btn-ghost" onClick={prevStep} aria-label="Go back to theme selection">← Back</button>
        <motion.button
          className="btn btn-primary"
          onClick={onPreview}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          aria-label="Open live preview of your love website"
        >
          👁&nbsp; Live Preview
        </motion.button>
        <motion.button
          className="btn btn-gold"
          onClick={onGenerate}
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.97 }}
          aria-label="Generate and download your love website as a ZIP file"
        >
          ⬇️&nbsp; Download
        </motion.button>
      </div>
    </div>
  )
}
