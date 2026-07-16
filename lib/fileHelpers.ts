import type { PhotoFile, MusicFile, VideoFile } from '@/types'

/** Read a File object as a data URL, returning a Promise */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') resolve(result)
      else reject(new Error('FileReader result was not a string'))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/** Process an array of image Files into PhotoFile objects */
export async function processPhotos(files: File[]): Promise<PhotoFile[]> {
  const results: PhotoFile[] = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const dataUrl = await readFileAsDataUrl(file)
    results.push({
      id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      dataUrl,
    })
  }
  return results
}

/** Process a single audio File into a MusicFile object */
export async function processMusic(file: File): Promise<MusicFile> {
  const dataUrl = await readFileAsDataUrl(file)
  return { name: file.name, dataUrl }
}

/** Process a single video File into a VideoFile object */
export async function processVideo(file: File): Promise<VideoFile> {
  const dataUrl = await readFileAsDataUrl(file)
  return { name: file.name, dataUrl }
}

/** Trigger a browser download for a Blob */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
