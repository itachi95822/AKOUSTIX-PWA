import type { ReactNode } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { cx } from '@/utils/format'

// ============================================================
// Small presentational primitives shared across screens.
// ============================================================

export function SectionHeader({
  title,
  action,
  onAction
}: {
  title: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="flex items-end justify-between px-4 mb-3 mt-6">
      <h2 className="font-display text-[22px] leading-tight tracking-tight text-era-text">
        {title}
      </h2>
      {action && (
        <button
          onClick={onAction}
          className="text-[13px] font-body text-era-text-muted hover:text-era-accent transition-colors uppercase tracking-wide"
        >
          {action}
        </button>
      )}
    </div>
  )
}

export function ScreenHeader({
  title,
  subtitle,
  right
}: {
  title: string
  subtitle?: string
  right?: ReactNode
}) {
  return (
    <header className="px-4 pt-6 pb-2 flex items-end justify-between">
      <div>
        <h1 className="font-display text-[30px] leading-none tracking-tight text-era-text">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-[13px] text-era-text-muted font-body">{subtitle}</p>
        )}
      </div>
      {right}
    </header>
  )
}

export function EmptyState({
  icon,
  title,
  message
}: {
  icon?: ReactNode
  title: string
  message: string
}) {
  return (
    <div className="px-6 py-16 text-center">
      {icon && (
        <div className="mx-auto mb-4 w-16 h-16 rounded-era era-bevel bg-era-surface flex items-center justify-center text-era-text-muted">
          {icon}
        </div>
      )}
      <p className="font-display text-xl text-era-text">{title}</p>
      <p className="mt-2 text-[14px] text-era-text-muted font-body max-w-xs mx-auto">
        {message}
      </p>
    </div>
  )
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="px-6 py-16 flex flex-col items-center gap-3 text-era-text-muted">
      <Loader2 size={28} className="animate-spin text-era-accent-solid" />
      <p className="font-mono text-[13px] tracking-wide">{label}</p>
    </div>
  )
}

export function ErrorState({
  message,
  onRetry
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="px-6 py-16 flex flex-col items-center gap-3 text-center">
      <div className="w-16 h-16 rounded-era era-bevel bg-era-surface flex items-center justify-center text-era-accent-solid">
        <RefreshCw size={26} />
      </div>
      <p className="font-display text-xl text-era-text">Couldn’t load your library</p>
      <p className="text-[14px] text-era-text-muted font-body max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 era-bevel rounded-era bg-era-accent-solid text-era-accent-contrast h-10 px-5 text-[14px] font-body inline-flex items-center gap-2"
        >
          <RefreshCw size={15} /> Try again
        </button>
      )}
    </div>
  )
}

export function Pill({
  active,
  children,
  onClick
}: {
  active?: boolean
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'px-4 h-9 rounded-eraPill text-[13px] font-body whitespace-nowrap era-bevel transition-colors',
        active
          ? 'bg-era-accent-solid text-era-accent-contrast'
          : 'bg-era-surface text-era-text-muted hover:text-era-text'
      )}
    >
      {children}
    </button>
  )
}
