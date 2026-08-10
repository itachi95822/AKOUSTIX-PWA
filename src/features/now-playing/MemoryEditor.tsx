import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, Images, Check } from 'lucide-react'
import type { SongMemory } from '@/types'
import { fileToMemoryDataUrl } from '@/utils/image'
import { cx } from '@/utils/format'

// ============================================================
// MemoryEditor — clean create/edit dialog for a song's Memory.
// Up to 5 gallery photos (preview + remove), an optional
// 10-word note, and optional date + time. The parent mounts it
// fresh (keyed by song) so it always opens with pristine state
// or the existing Memory pre-filled.
// ============================================================

const MAX_PHOTOS = 5
const MAX_WORDS = 10

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function MemoryEditor({
  songTitle,
  initial,
  onClose,
  onSaved
}: {
  songTitle: string
  initial?: SongMemory
  onClose: () => void
  onSaved: (memory: SongMemory) => void
}) {
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? [])
  const [note, setNote] = useState(initial?.note ?? '')
  const [date, setDate] = useState(initial?.date ?? '')
  const [time, setTime] = useState(initial?.time ?? '')
  const [reading, setReading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const wordCount = countWords(note)
  const noteTooLong = wordCount > MAX_WORDS
  const canSave = photos.length > 0 && !noteTooLong

  const pickPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0 || reading) return
    setReading(true)
    try {
      const room = MAX_PHOTOS - photos.length
      const selected = Array.from(files).slice(0, room)
      const converted = await Promise.all(selected.map(fileToMemoryDataUrl))
      setPhotos((prev) => [...prev, ...converted])
    } finally {
      setReading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const save = () => {
    if (!canSave) return
    onSaved({
      songId: initial?.songId ?? '',
      photos,
      note: note.trim() ? note.trim() : undefined,
      date: date || undefined,
      time: time || undefined,
      updatedAt: Date.now()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ y: '100%', opacity: 0.8 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="relative flex flex-col max-h-[88dvh] w-full max-w-[480px] mx-auto sm:rounded-t-eraLg sm:rounded-b-2xl rounded-t-eraLg bg-era-surface border border-era-border"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-era-border shrink-0">
          <div className="flex items-center gap-2">
            <Images size={18} className="text-era-accent-solid" />
            <h3 className="font-display text-xl text-era-text">
              {initial ? 'Edit Memory' : 'Add Memory'}
            </h3>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="w-9 h-9 inline-flex items-center justify-center rounded-eraPill text-era-text-muted hover:text-era-text"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto era-scroll px-4 py-4 flex flex-col gap-5">
          <p className="text-[13px] font-body text-era-text-muted -mb-2">
            A Memory for <span className="text-era-text">“{songTitle}”</span>
          </p>

          {/* Photos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-era-text-muted">
                Photos · {photos.length}/{MAX_PHOTOS}
              </span>
              {photos.length > 0 && (
                <span className="text-[11px] font-mono text-era-text-muted">required</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((src, i) => (
                <div
                  key={`${i}-${src.slice(0, 24)}`}
                  className="relative aspect-square rounded-era overflow-hidden era-bevel bg-era-surface-alt"
                >
                  <img src={src} alt={`Memory photo ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                  <button
                    aria-label="Remove photo"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full inline-flex items-center justify-center bg-black/60 text-white"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={reading}
                  className="aspect-square rounded-era border border-dashed border-era-border bg-era-surface-alt/50 inline-flex flex-col items-center justify-center gap-1 text-era-text-muted hover:text-era-text disabled:opacity-50"
                >
                  <Plus size={20} />
                  <span className="text-[11px] font-body">{reading ? '…' : 'Add'}</span>
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => void pickPhotos(e.target.files)}
            />
          </div>

          {/* Note */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-era-text-muted">
                Note · optional
              </span>
              <span className={cx('text-[11px] font-mono', noteTooLong ? 'text-red-400' : 'text-era-text-muted')}>
                {wordCount}/{MAX_WORDS} words
              </span>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What does this song remember?"
              rows={3}
              className="w-full resize-none rounded-era bg-era-surface-alt px-3 py-2.5 text-[14px] font-body text-era-text placeholder:text-era-text-muted/60 focus:outline-none focus:ring-1 focus:ring-era-accent"
            />
            {noteTooLong && (
              <p className="mt-1 text-[12px] font-body text-red-400">
                Keep the note to {MAX_WORDS} words or fewer.
              </p>
            )}
          </div>

          {/* Date + time */}
          <div>
            <span className="block text-[11px] font-mono uppercase tracking-widest text-era-text-muted mb-2">
              Date & time · optional
            </span>
            <div className="flex gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 min-w-0 rounded-era bg-era-surface-alt px-3 py-2.5 text-[14px] font-body text-era-text [color-scheme:dark] focus:outline-none focus:ring-1 focus:ring-era-accent"
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex-1 min-w-0 rounded-era bg-era-surface-alt px-3 py-2.5 text-[14px] font-body text-era-text [color-scheme:dark] focus:outline-none focus:ring-1 focus:ring-era-accent"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-era-border flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-eraPill era-bevel bg-era-surface-alt text-era-text-muted hover:text-era-text text-[14px] font-body"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!canSave}
            className="h-10 px-5 rounded-eraPill era-bevel bg-era-accent-solid text-era-accent-contrast text-[14px] font-body inline-flex items-center gap-1.5 disabled:opacity-40"
          >
            <Check size={15} />
            {initial ? 'Save changes' : 'Save memory'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
