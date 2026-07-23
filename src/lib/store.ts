import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MediaFile = { name: string; dataUrl: string };

interface LovecraftStore {
  currentStep: number;
  setStep: (n: number) => void;

  name1: string;
  name2: string;
  date: string;
  duration: string;
  memory: string;
  message: string;
  setField: (
    key: "name1" | "name2" | "date" | "duration" | "memory" | "message",
    v: string,
  ) => void;

  photos: MediaFile[];
  music: MediaFile | null;
  video: MediaFile | null;
  addPhotos: (photos: MediaFile[]) => void;
  removePhoto: (idx: number) => void;
  setMusic: (m: MediaFile | null) => void;
  setVideo: (v: MediaFile | null) => void;

  theme: string;
  setTheme: (t: string) => void;

  isGenerating: boolean;
  isComplete: boolean;
  setGenerating: (v: boolean) => void;
  setComplete: (v: boolean) => void;

  reset: () => void;
}

const initial = {
  currentStep: 0,
  name1: "",
  name2: "",
  date: "",
  duration: "",
  memory: "",
  message: "",
  photos: [] as MediaFile[],
  music: null as MediaFile | null,
  video: null as MediaFile | null,
  theme: "cosmic",
  isGenerating: false,
  isComplete: false,
};

export const useLovecraft = create<LovecraftStore>()(
  persist(
    (set) => ({
      ...initial,
      setStep: (n) => set({ currentStep: n }),
      setField: (key, v) => set({ [key]: v } as never),
      addPhotos: (photos) => set((s) => ({ photos: [...s.photos, ...photos].slice(0, 24) })),
      removePhoto: (idx) => set((s) => ({ photos: s.photos.filter((_, i) => i !== idx) })),
      setMusic: (music) => set({ music }),
      setVideo: (video) => set({ video }),
      setTheme: (theme) => set({ theme }),
      setGenerating: (v) => set({ isGenerating: v }),
      setComplete: (v) => set({ isComplete: v }),
      reset: () => set({ ...initial }),
    }),
    {
      name: "lovecraft-store",
      // Skip large blobs during hydration to avoid quota issues on refresh
      partialize: (s) => ({
        currentStep: s.currentStep,
        name1: s.name1,
        name2: s.name2,
        date: s.date,
        duration: s.duration,
        memory: s.memory,
        message: s.message,
        theme: s.theme,
      }),
    },
  ),
);
