import { useCallback } from 'react'
import { processPhotos, processMusic, processVideo } from '@/lib/fileHelpers'
import { useGeneratorStore } from '@/store/useGeneratorStore'

/**
 * Hook that wraps file processing with Zustand store updates.
 * Returns handlers ready to pass to input onChange events.
 */
export function useFileReader() {
  const addPhotos = useGeneratorStore((s) => s.addPhotos)
  const setMusic = useGeneratorStore((s) => s.setMusic)
  const setVideo = useGeneratorStore((s) => s.setVideo)

  const handlePhotos = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      const processed = await processPhotos(Array.from(files))
      addPhotos(processed)
    },
    [addPhotos]
  )

  const handleMusic = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      const processed = await processMusic(files[0])
      setMusic(processed)
    },
    [setMusic]
  )

  const handleVideo = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      const processed = await processVideo(files[0])
      setVideo(processed)
    },
    [setVideo]
  )

  return { handlePhotos, handleMusic, handleVideo }
}
