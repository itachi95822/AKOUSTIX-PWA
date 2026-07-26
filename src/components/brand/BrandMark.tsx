import { useEraStore } from '@/eras/EraProvider'
import { cx } from '@/utils/format'

// ============================================================
// BrandMark — the AKOUSTIX wordmark + tagline.
// Restyles subtly per era through the era font + letter-spacing
// utilities. Shown at the top of Home + Settings.
// ============================================================

export function BrandMark({
  size = 'md',
  showTagline = true
}: {
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
}) {
  const era = useEraStore((s) => s.era)

  const sizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-5xl'
  } as const

  return (
    <div className="leading-none">
      <h1
        className={cx(
          'font-display text-era-text tracking-tight',
          sizes[size],
          era === 'cd' && 'tracking-[0.3em] font-light',
          era === 'computer' && 'tracking-wider'
        )}
      >
        AKOUSTIX
      </h1>
      {showTagline && (
        <p
          className={cx(
            'mt-1 text-[11px] font-mono text-era-text-muted uppercase',
            era === 'cd' && 'tracking-[0.25em] font-light'
          )}
        >
          Every Song Has A Memory.
        </p>
      )}
    </div>
  )
}
