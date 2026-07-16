import type { ThemeConfig, ThemeId } from '@/types'

// ── Exact colors from original HTML ──────────────────────────────────────────

export const THEMES: Record<ThemeId, ThemeConfig> = {
  cosmic: {
    id: 'cosmic',
    name: 'Cosmic Love',
    vibes: 'Stars · Nebulae · Stardust',
    icon: '🌌',
    bg: '#03020f',
    c1: '#c060a0',
    c2: '#7030d0',
    c3: '#c9a96e',
    cardClass: 'bg-gradient-to-br from-[#06041e] to-[#150835]',
  },
  memories: {
    id: 'memories',
    name: 'Forever Memories',
    vibes: 'Warm · Golden · Nostalgic',
    icon: '🕯️',
    bg: '#0e0505',
    c1: '#d08040',
    c2: '#a02020',
    c3: '#c9a96e',
    cardClass: 'bg-gradient-to-br from-[#180808] to-[#2a1005]',
  },
  rose: {
    id: 'rose',
    name: 'Rose Garden',
    vibes: 'Petals · Velvet · Romance',
    icon: '🌹',
    bg: '#0d0009',
    c1: '#e8507a',
    c2: '#a01850',
    c3: '#f0b0c8',
    cardClass: 'bg-gradient-to-br from-[#160010] to-[#2a0025]',
  },
  dream: {
    id: 'dream',
    name: 'Dream Universe',
    vibes: 'Surreal · Electric · Ethereal',
    icon: '✨',
    bg: '#020210',
    c1: '#5090e8',
    c2: '#5020c0',
    c3: '#80d0ff',
    cardClass: 'bg-gradient-to-br from-[#030815] to-[#081528]',
  },
  cinematic: {
    id: 'cinematic',
    name: 'Cinematic Story',
    vibes: 'Film grain · Drama · Epic',
    icon: '🎞️',
    bg: '#050505',
    c1: '#d0a050',
    c2: '#805020',
    c3: '#f0d090',
    cardClass: 'bg-gradient-to-br from-[#080808] to-[#181208]',
  },
  proposal: {
    id: 'proposal',
    name: 'Proposal Special',
    vibes: 'Champagne · Magic · Forever',
    icon: '💍',
    bg: '#090600',
    c1: '#c9a96e',
    c2: '#e8c060',
    c3: '#fff0c0',
    cardClass: 'bg-gradient-to-br from-[#100a00] to-[#201500]',
  },
}

/** Convert a #rrggbb hex string to an "r,g,b" string for use in rgba() */
export function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}
