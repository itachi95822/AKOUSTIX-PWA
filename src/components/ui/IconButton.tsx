import type { ButtonHTMLAttributes } from 'react'
import { cx } from '@/utils/format'

// ============================================================
// IconButton — circular tactile control used by the player
// and headers. Era-aware via era tokens; computer era gets a
// square bevel through `.era-bevel`.
// ============================================================

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  active?: boolean
  label: string
}

const SIZES: Record<NonNullable<IconButtonProps['size']>, string> = {
  sm: 'w-9 h-9',
  md: 'w-11 h-11',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20'
}

export function IconButton({
  size = 'md',
  active = false,
  label,
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex items-center justify-center era-bevel',
        'transition-[transform,filter,background-color] duration-150 active:translate-y-px',
        active
          ? 'bg-era-accent-solid text-era-accent-contrast'
          : 'bg-transparent text-era-text hover:bg-era-surface-alt',
        'rounded-eraPill',
        SIZES[size],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
