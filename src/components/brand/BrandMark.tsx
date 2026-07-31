import { useEraStore } from '@/eras/EraProvider'
import { cx } from '@/utils/format'

// ============================================================
// BrandMark — the AKOUSTIX logo tile + tagline.
// Shown at the top of Home + Settings. The tile carries a
// subtle era-aware ring so it reads on light and dark surfaces.
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
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-24 h-24'
  } as const

  return (
    <div className="flex items-center gap-3 min-w-0">
      <img
        src="/akoustix-logo.png"
        alt="AKOUSTIX"
        draggable={false}
        className={cx(
          sizes[size],
          'shrink-0 object-cover rounded-[22%] shadow-era-soft',
          era === 'cd' ? 'ring-1 ring-white/15' : 'ring-1 ring-black/10'
        )}
      />
      {showTagline && (
        <p
          className={cx(
            'text-[11px] font-mono text-era-text-muted uppercase leading-snug',
            era === 'cd' && 'tracking-[0.25em] font-light'
          )}
        >
          Every Song Has
          <br />
          A Memory.
        </p>
      )}
    </div>
  )
}
