import { motion } from 'framer-motion'
import { cx } from '@/utils/format'

// ============================================================
// AlbumArt — renders an album's cover (gradient when no image
// is present) in an era-aware frame. Optional gentle float.
// ============================================================

interface AlbumArtProps {
  cover: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  float?: boolean
  rounded?: boolean
  className?: string
  onClick?: () => void
}

const SIZES: Record<NonNullable<AlbumArtProps['size']>, string> = {
  sm: 'w-14 h-14',
  md: 'w-32 h-32',
  lg: 'w-44 h-44',
  xl: 'w-64 h-64',
  full: 'w-full aspect-square'
}

export function AlbumArt({
  cover,
  alt,
  size = 'md',
  float = false,
  rounded = true,
  className,
  onClick
}: AlbumArtProps) {
  const Comp = onClick ? motion.button : motion.div
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.04 } : undefined}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      animate={float ? { y: [0, -8, 0] } : undefined}
      style={
        float
          ? { animationDuration: '6s' }
          : undefined
      }
      className={cx(
        SIZES[size],
        rounded && 'rounded-era',
        'relative overflow-hidden shadow-era-soft shrink-0',
        'ring-1 ring-black/5',
        className
      )}
      aria-label={alt}
    >
      <div className="absolute inset-0" style={{ background: cover }} />
      {/* subtle gloss for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20" />
    </Comp>
  )
}
