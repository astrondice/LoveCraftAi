'use client'

import { useGeneratorStore } from '@/store/useGeneratorStore'
import { THEMES } from '@/lib/themeColors'
import ThemeCard from '@/components/themes/ThemeCard'
import type { ThemeId } from '@/types'

const THEME_ORDER: ThemeId[] = ['cosmic', 'memories', 'rose', 'dream', 'cinematic', 'proposal']

export default function StepTheme() {
  const { theme: selected, setTheme, nextStep, prevStep } = useGeneratorStore()

  return (
    <div>
      <div className="sp-eye" aria-hidden="true">Step 03 — The World</div>
      <h2 className="sp-title">Choose Your Universe</h2>
      <p className="sp-desc">
        Each theme is a complete cinematic world with unique animations and emotional signature.
      </p>

      <div
        className="themes-grid"
        role="radiogroup"
        aria-label="Select a visual theme for your love website"
      >
        {THEME_ORDER.map((id) => {
          const t = THEMES[id]
          return (
            <ThemeCard
              key={id}
              theme={t}
              isSelected={selected === id}
              onSelect={() => setTheme(id)}
            />
          )
        })}
      </div>

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={prevStep} aria-label="Go back to photo upload">← Back</button>
        <button className="btn btn-primary" onClick={nextStep} aria-label="Continue to create and download step">Continue &nbsp;→</button>
      </div>
    </div>
  )
}
