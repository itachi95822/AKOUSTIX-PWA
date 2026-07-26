import type { EraId } from '@/types'

// ============================================================
// Era metadata — the user-facing identity of each era.
// Visual tokens (colors, fonts, radii) live as CSS variables
// in src/index.css and are switched via `data-era` on <html>.
// This file describes the era for UI copy, choosers, etc.
// ============================================================ //

export interface EraMeta {
  id: EraId
  /** Short label shown in the era chooser + settings. */
  name: string
  /** Emoji glyph used inline. */
  glyph: string
  /** One-line description for the era chooser. */
  tagline: string
  /** Longer description shown on the era card. */
  description: string
  /** Accent swatches shown on the era card. */
  swatches: string[]
  /** Era-specific subtitle for the brand wordmark. */
  eraLabel: string
}

export const ERAS: Record<EraId, EraMeta> = {
  cassette: {
    id: 'cassette',
    name: 'Cassette Era',
    glyph: '📼',
    tagline: 'Analogue warmth, rotating reels.',
    description:
      'Inspired by vintage cassette players and analogue audio equipment — wooden textures, mechanical knobs, VU meters and softly spinning tape reels.',
    swatches: ['#f3e8cf', '#6b4a2b', '#221e1a', '#c8b48f', '#c97a3f'],
    eraLabel: 'Analogue · 1970s'
  },
  cd: {
    id: 'cd',
    name: 'Compact Disc Era',
    glyph: '💿',
    tagline: 'Brushed aluminium, pristine clarity.',
    description:
      'Inspired by premium CD and portable disc players — rotating discs, metallic reflections, glass surfaces and clean minimal controls.',
    swatches: ['#ffffff', '#1a1a1a', '#b8b8b8', '#c9c9c9', '#ff6a00'],
    eraLabel: 'Digital · 1990s'
  },
  computer: {
    id: 'computer',
    name: 'Computer Era',
    glyph: '🖥️',
    tagline: 'Pixel desktops, beveled everything.',
    description:
      'Inspired by classic desktop music players — boxy windows, beveled buttons, pixel icons and title bars. Playful nostalgia, fully usable on modern touch screens.',
    swatches: ['#c0c0c0', '#008080', '#000080', '#ffffff', '#000000'],
    eraLabel: 'Desktop · 1990s'
  }
}

export const ERA_ORDER: EraId[] = ['cassette', 'cd', 'computer']

export const DEFAULT_ERA: EraId = 'cassette'
