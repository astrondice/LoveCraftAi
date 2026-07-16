'use client'

import { useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGeneratorStore } from '@/store/useGeneratorStore'
import { useFileReader } from '@/hooks/useFileReader'
import PhotoStrip from '@/components/upload/PhotoStrip'
import DropZone from '@/components/upload/DropZone'

// Max file sizes (in bytes)
const MAX_IMAGE_SIZE_MB = 10
const MAX_AUDIO_SIZE_MB = 50
const MAX_VIDEO_SIZE_MB = 100
const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024
const MAX_AUDIO_SIZE = MAX_AUDIO_SIZE_MB * 1024 * 1024
const MAX_VIDEO_SIZE = MAX_VIDEO_SIZE_MB * 1024 * 1024

export default function StepUpload() {
  const { photos, music, video, nextStep, prevStep } = useGeneratorStore()
  const { handlePhotos, handleMusic, handleVideo } = useFileReader()

  const [photoDragging, setPhotoDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const photoInputRef = useRef<HTMLInputElement>(null)
  const musicInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const showError = useCallback((msg: string) => {
    setError(msg)
    setTimeout(() => setError(null), 4000)
  }, [])

  const validateAndHandlePhotos = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const oversized = Array.from(files).find((f) => f.size > MAX_IMAGE_SIZE)
      if (oversized) {
        showError(`"${oversized.name}" is too large (max ${MAX_IMAGE_SIZE_MB} MB per image).`)
        return
      }
      handlePhotos(files)
    },
    [handlePhotos, showError]
  )

  const validateAndHandleMusic = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return
      if (files[0].size > MAX_AUDIO_SIZE) {
        showError(`Audio file is too large (max ${MAX_AUDIO_SIZE_MB} MB).`)
        return
      }
      handleMusic(files)
    },
    [handleMusic, showError]
  )

  const validateAndHandleVideo = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return
      if (files[0].size > MAX_VIDEO_SIZE) {
        showError(`Video file is too large (max ${MAX_VIDEO_SIZE_MB} MB).`)
        return
      }
      handleVideo(files)
    },
    [handleVideo, showError]
  )

  const onPhotoDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setPhotoDragging(false)
    validateAndHandlePhotos(e.dataTransfer.files)
  }

  return (
    <div>
      <div className="sp-eye" aria-hidden="true">Step 02 — The Memories</div>
      <h2 className="sp-title">Upload Your World</h2>
      <p className="sp-desc">
        Photos become cinematic frames. Music becomes the heartbeat. Nothing leaves your device.
      </p>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            role="alert"
            aria-live="assertive"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              background: 'rgba(232,85,122,0.12)',
              border: '1px solid rgba(232,85,122,0.3)',
              borderRadius: 10,
              padding: '0.65rem 1rem',
              marginBottom: '1rem',
              fontSize: '0.82rem',
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="upload-grid">
        {/* Photos */}
        <DropZone
          icon="🖼️"
          title="Photos"
          hint="JPG · PNG · WEBP"
          hint2={`Up to ${MAX_IMAGE_SIZE_MB} MB each`}
          isDragging={photoDragging}
          statusText={photos.length > 0 ? `${photos.length} photo${photos.length > 1 ? 's' : ''} ✓` : ''}
          borderColor={photos.length > 0 ? 'rgba(201,169,110,0.6)' : undefined}
          onDragOver={(e) => { e.preventDefault(); setPhotoDragging(true) }}
          onDragLeave={() => setPhotoDragging(false)}
          onDrop={onPhotoDrop}
          onClick={() => photoInputRef.current?.click()}
          ariaLabel="Upload photos — click or drag and drop image files here"
        />

        {/* Music */}
        <DropZone
          icon="🎵"
          title="Music"
          hint="MP3 · WAV · OGG"
          hint2="One track"
          statusText={music ? `"${music.name.replace(/\.[^.]+$/, '').slice(0, 22)}" ✓` : ''}
          borderColor={music ? 'rgba(232,85,122,0.6)' : undefined}
          onClick={() => musicInputRef.current?.click()}
          ariaLabel={music ? `Music loaded: ${music.name}. Click to change.` : 'Upload music track — click to select audio file'}
        />

        {/* Video */}
        <DropZone
          icon="🎬"
          title="Video"
          hint="MP4 · MOV · WEBM"
          hint2="Optional"
          statusText={video ? 'Video loaded ✓' : ''}
          borderColor={video ? 'rgba(96,160,240,0.6)' : undefined}
          onClick={() => videoInputRef.current?.click()}
          ariaLabel={video ? `Video loaded: ${video.name}. Click to change.` : 'Upload video (optional) — click to select video file'}
        />
      </div>

      {/* Hidden file inputs */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => validateAndHandlePhotos(e.target.files)}
      />
      <input
        ref={musicInputRef}
        type="file"
        accept="audio/mpeg,audio/wav,audio/ogg,audio/mp3,audio/*"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => validateAndHandleMusic(e.target.files)}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/*"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => validateAndHandleVideo(e.target.files)}
      />

      {/* Photo strip */}
      <AnimatePresence>
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PhotoStrip />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={prevStep} aria-label="Go back to story step">← Back</button>
        <button className="btn btn-primary" onClick={nextStep} aria-label="Continue to theme selection">Continue &nbsp;→</button>
      </div>
    </div>
  )
}
