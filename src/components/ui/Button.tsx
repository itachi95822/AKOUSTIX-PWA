import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '@/utils/format'

// ============================================================
// Button — era-aware. Computer era renders a beveled Win32
// button via the `.era-bevel` utility; other eras use a soft
// raised surface. Stays canvas-editable (static className).
// ============================================================

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'surface'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const VARIANTS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-era-accent-solid text-era-accent-contrast era-bevel hover:brightness-110',
  surface: 'bg-era-surface text-era-text border border-era-border era-bevel hover:brightness-105',
  ghost: 'bg-transparent text-era-text hover:bg-era-surface-alt'
}

const SIZES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-14 px-7 text-base'
}

export function Button({
  variant = 'surface',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-era font-body',
        'select-none transition-[filter,transform,background-color] duration-200',
        'active:translate-y-px disabled:opacity-40 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
