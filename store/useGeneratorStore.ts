import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { GeneratorState, PhotoFile, MusicFile, VideoFile, ThemeId } from '@/types'

// ── Actions interface ─────────────────────────────────────────────────────────

interface GeneratorActions {
  /** Go to a specific step (0-3). Will not go beyond adjacent unless already completed. */
  gotoStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  /** Append new photos to the existing list */
  addPhotos: (photos: PhotoFile[]) => void
  /** Remove a photo by id */
  removePhoto: (id: string) => void
  setMusic: (music: MusicFile | null) => void
  setVideo: (video: VideoFile | null) => void
  setTheme: (theme: ThemeId) => void
  /** Update a single text form field */
  setField: (
    field: keyof Pick<
      GeneratorState,
      'name1' | 'name2' | 'specialDate' | 'duration' | 'favMemory' | 'loveMessage'
    >,
    value: string
  ) => void
  /** Reset the entire store to initial state */
  reset: () => void
}

type Store = GeneratorState & GeneratorActions

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState: GeneratorState = {
  step: 0,
  photos: [],
  music: null,
  video: null,
  theme: 'cosmic',
  name1: '',
  name2: '',
  specialDate: '',
  duration: '',
  favMemory: '',
  loveMessage: '',
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useGeneratorStore = create<Store>()(
  devtools(
    (set, get) => ({
      ...initialState,

      gotoStep: (step) => {
        const current = get().step
        if (step > current + 1) return
        set({ step })
      },

      nextStep: () => {
        const current = get().step
        if (current < 3) set({ step: current + 1 })
      },

      prevStep: () => {
        const current = get().step
        if (current > 0) set({ step: current - 1 })
      },

      addPhotos: (photos) =>
        set((s) => ({ photos: [...s.photos, ...photos] })),

      removePhoto: (id) =>
        set((s) => ({ photos: s.photos.filter((p) => p.id !== id) })),

      setMusic: (music) => set({ music }),
      setVideo: (video) => set({ video }),
      setTheme: (theme) => set({ theme }),

      setField: (field, value) =>
        set({ [field]: value } as Partial<GeneratorState>),

      reset: () => set(initialState),
    }),
    { name: 'LoveCraftGenerator' }
  )
)
