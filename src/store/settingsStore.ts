import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================
// Settings store — small, local-only preferences. Deliberately
// minimal: only audio quality. Era lives in `EraProvider`.
// ============================================================

export type AudioQuality = 'low' | 'medium' | 'high' | 'lossless'

export const AUDIO_QUALITY_LABELS: Record<AudioQuality, string> = {
  low: 'Low · 96 kbps',
  medium: 'Medium · 160 kbps',
  high: 'High · 320 kbps',
  lossless: 'Lossless · FLAC'
}

interface SettingsState {
  audioQuality: AudioQuality
  setAudioQuality: (q: AudioQuality) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      audioQuality: 'high',
      setAudioQuality: (audioQuality) => set({ audioQuality })
    }),
    { name: 'akoustix-settings' }
  )
)

export const APP_VERSION = '1.0.0'
