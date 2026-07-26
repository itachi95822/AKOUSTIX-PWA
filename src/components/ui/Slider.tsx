import { cx } from '@/utils/format'

// ============================================================
// Slider — thin wrapper over a native range input, styled via
// era tokens (`accent-color` + era track). Era-specific player
// screens render their own progress visuals (tape spool, CD
// ring, chunky desktop bar); this Slider is used for volume
// and generic progress where a standard scrubber is enough.
// ============================================================

interface SliderProps {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  ariaLabel: string
  className?: string
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  ariaLabel,
  className
}: SliderProps) {
  return (
    <input
      type="range"
      aria-label={ariaLabel}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cx('akx-range w-full', className)}
      style={{ accentColor: 'var(--era-accent-solid)' }}
    />
  )
}
