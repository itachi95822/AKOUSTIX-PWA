import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

// ============================================================
// Rail — horizontal scroll strip with optional arrow buttons.
// Hides its scrollbar; supports era-aware scrolling.
// ============================================================

export function Rail({
  children,
  ariaLabel
}: {
  children: ReactNode
  ariaLabel: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  const scroll = (dir: -1 | 1) => {
    ref.current?.scrollBy({ left: dir * 280, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        role="list"
        aria-label={ariaLabel}
        className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory"
      >
        {children}
      </div>
      <button
        aria-label="Scroll left"
        onClick={() => scroll(-1)}
        className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-eraPill era-bevel bg-era-surface/90 text-era-text items-center justify-center"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        aria-label="Scroll right"
        onClick={() => scroll(1)}
        className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-eraPill era-bevel bg-era-surface/90 text-era-text items-center justify-center"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
