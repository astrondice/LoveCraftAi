// ── Core data types ─────────────────────────────────────────────────────────

export interface PhotoFile {
  id: string
  name: string
  dataUrl: string
}

export interface MusicFile {
  name: string
  dataUrl: string
}

export interface VideoFile {
  name: string
  dataUrl: string
}

// ── Theme system ─────────────────────────────────────────────────────────────

export type ThemeId =
  | 'cosmic'
  | 'memories'
  | 'rose'
  | 'dream'
  | 'cinematic'
  | 'proposal'

export interface ThemeConfig {
  id: ThemeId
  name: string
  vibes: string
  icon: string
  bg: string
  /** primary accent hex */
  c1: string
  /** secondary accent hex */
  c2: string
  /** tertiary / highlight hex */
  c3: string
  /** tailwind gradient bg class */
  cardClass: string
}

// ── Generator state ──────────────────────────────────────────────────────────

export interface GeneratorState {
  step: number
  photos: PhotoFile[]
  music: MusicFile | null
  video: VideoFile | null
  theme: ThemeId
  // Form fields
  name1: string
  name2: string
  specialDate: string
  duration: string
  favMemory: string
  loveMessage: string
}

// ── Summary item used on step 4 ──────────────────────────────────────────────

export interface SummaryItem {
  icon: string
  label: string
  value: string
}
