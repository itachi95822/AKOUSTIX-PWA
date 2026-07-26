import { useEffect, type ReactNode } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EraId } from '@/types'
import { DEFAULT_ERA, ERAS, ERA_ORDER } from './eras'

// ============================================================
// Era store + provider.
// The active era is persisted to localStorage and applied to
// <html data-era="..."> so CSS variables restyle the app.
// Playback lives in a separate store, so switching eras never
// interrupts the music.
// ============================================================ //

interface EraState {
  era: EraId
  setEra: (era: EraId) => void
  cycleEra: () => void
}

export const useEraStore = create<EraState>()(
  persist(
    (set, get) => ({
      era: DEFAULT_ERA,
      setEra: (era) => set({ era }),
      cycleEra: () => {
        const idx = ERA_ORDER.indexOf(get().era)
        set({ era: ERA_ORDER[(idx + 1) % ERA_ORDER.length] })
      }
    }),
    {
      name: 'akoustix-era',
      // Only persist the era id itself.
      partialize: (s) => ({ era: s.era })
    }
  )
)

/** Apply the current era to <html> and the theme-color meta. */
function applyEraToDom(era: EraId) {
  const root = document.documentElement
  root.setAttribute('data-era', era)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', ERA_THEME_COLORS[era])
  }
}

const ERA_THEME_COLORS: Record<EraId, string> = {
  cassette: '#221e1a',
  cd: '#f4f4f2',
  computer: '#008080'
}

export function EraProvider({ children }: { children: ReactNode }) {
  const era = useEraStore((s) => s.era)

  useEffect(() => {
    applyEraToDom(era)
  }, [era])

  // Ensure the dom reflects the persisted era on first paint.
  useEffect(() => {
    applyEraToDom(era)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}

export { ERAS, ERA_ORDER, DEFAULT_ERA }
