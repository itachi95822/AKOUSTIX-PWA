import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Info, Mic2, Gauge, MessageSquareHeart, Check, Download, Share } from 'lucide-react'
import { BrandMark } from '@/components/brand/BrandMark'
import { ScreenHeader } from '@/components/ui/Primitives'
import { useEraStore, ERAS, ERA_ORDER } from '@/eras/EraProvider'
import type { EraId } from '@/types'
import { useSettingsStore, AUDIO_QUALITY_LABELS, APP_VERSION, type AudioQuality } from '@/store/settingsStore'
import { useInstallPrompt } from '@/components/pwa/InstallPrompt'
import { cx } from '@/utils/format'

// ============================================================
// Settings — deliberately tiny.
// Choose Your Era · Audio Quality · About · Version · Feedback.
// No backend, storage, developer or debug options.
// ============================================================

export function SettingsScreen() {
  const era = useEraStore((s) => s.era)
  const setEra = useEraStore((s) => s.setEra)
  const audioQuality = useSettingsStore((s) => s.audioQuality)
  const setAudioQuality = useSettingsStore((s) => s.setAudioQuality)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [qualityOpen, setQualityOpen] = useState(false)

  return (
    <div className="pb-10">
      <div className="px-4 pt-8">
        <BrandMark size="md" />
      </div>
      <ScreenHeader title="Settings" subtitle="Keep it simple." />

      {/* Choose Your Era */}
      <section className="px-4 mt-4">
        <p className="text-[12px] font-mono uppercase tracking-widest text-era-text-muted mb-3">
          Choose Your Era
        </p>
        <div className="space-y-3">
          {ERA_ORDER.map((id) => (
            <EraCard
              key={id}
              id={id}
              active={era === id}
              onSelect={() => setEra(id)}
            />
          ))}
        </div>
        <p className="mt-3 text-[12px] text-era-text-muted font-body">
          Switching era transforms the whole app instantly — playback keeps going uninterrupted.
        </p>
      </section>

      {/* Audio Quality */}
      <section className="px-4 mt-8">
        <p className="text-[12px] font-mono uppercase tracking-widest text-era-text-muted mb-2">
          Audio Quality
        </p>
        <SettingRow
          icon={<Gauge size={18} />}
          label="Streaming quality"
          value={AUDIO_QUALITY_LABELS[audioQuality]}
          onClick={() => setQualityOpen((v) => !v)}
        />
        {qualityOpen && (
          <div className="mt-2 era-surface p-2 space-y-1">
            {(Object.keys(AUDIO_QUALITY_LABELS) as AudioQuality[]).map((q) => (
              <button
                key={q}
                onClick={() => {
                  setAudioQuality(q)
                  setQualityOpen(false)
                }}
                className={cx(
                  'w-full flex items-center justify-between px-3 h-11 rounded-era font-body text-[15px] transition-colors',
                  q === audioQuality
                    ? 'bg-era-accent-solid text-era-accent-contrast'
                    : 'text-era-text hover:bg-era-surface-alt'
                )}
              >
                <span>{AUDIO_QUALITY_LABELS[q]}</span>
                {q === audioQuality && <Check size={16} />}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* About */}
      <section className="px-4 mt-8">
        <p className="text-[12px] font-mono uppercase tracking-widest text-era-text-muted mb-2">
          About AKOUSTIX
        </p>
        <div className="era-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info size={16} className="text-era-accent-solid" />
            <p className="font-display text-lg text-era-text">Every Song Has A Memory.</p>
          </div>
          <p className="text-[13px] text-era-text-muted font-body leading-relaxed">
            AKOUSTIX is a nostalgia-inspired music player that lets you travel through three eras of
            music technology — cassette, compact disc and computer — while sharing one library and
            one playback system.
          </p>
        </div>
      </section>

      {/* Install app (PWA) */}
      <InstallSection />

      {/* Version */}
      <section className="px-4 mt-6">
        <SettingRow icon={<Mic2 size={18} />} label="Version" value={APP_VERSION} />
      </section>

      {/* Feedback */}
      <section className="px-4 mt-6">
        <SettingRow
          icon={<MessageSquareHeart size={18} />}
          label="Feedback"
          value="Tell us what you think"
          onClick={() => setFeedbackOpen(true)}
        />
        {feedbackOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 era-surface p-4"
          >
            <p className="font-body text-[14px] text-era-text">
              Thanks for listening on AKOUSTIX.
            </p>
            <p className="text-[13px] text-era-text-muted font-body mt-1">
              Feedback channels will open here once the backend is connected. For now, your library
              and eras are all yours.
            </p>
            <button
              onClick={() => setFeedbackOpen(false)}
              className="mt-3 h-9 px-4 rounded-era era-bevel bg-era-surface text-era-text font-body text-[14px]"
            >
              Close
            </button>
          </motion.div>
        )}
      </section>

      <div className="px-4 mt-10 text-center">
        <p className="text-[11px] font-mono text-era-text-muted uppercase tracking-widest">
          Made with care · {ERAS[era].eraLabel}
        </p>
      </div>
    </div>
  )
}

function EraCard({
  id,
  active,
  onSelect
}: {
  id: EraId
  active: boolean
  onSelect: () => void
}) {
  const meta = ERAS[id]
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cx(
        'w-full text-left rounded-era p-4 era-bevel transition-all',
        active
          ? 'bg-era-surface ring-2 ring-era-accent-solid'
          : 'bg-era-surface hover:bg-era-surface-alt'
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl leading-none">{meta.glyph}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-display text-lg text-era-text leading-tight">{meta.name}</p>
            {active && (
              <span className="text-[10px] font-mono uppercase tracking-widest text-era-accent-solid bg-era-accent-solid/10 px-1.5 py-0.5 rounded-eraPill">
                Active
              </span>
            )}
          </div>
          <p className="text-[12px] text-era-text-muted font-body leading-tight mt-0.5">
            {meta.tagline}
          </p>
        </div>
        <div className="flex gap-1">
          {meta.swatches.map((c) => (
            <span
              key={c}
              className="w-4 h-4 rounded-full ring-1 ring-black/10"
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
      <p className="mt-2 text-[12px] text-era-text-muted font-body leading-relaxed line-clamp-2">
        {meta.description}
      </p>
    </motion.button>
  )
}

function SettingRow({
  icon,
  label,
  value,
  onClick
}: {
  icon: React.ReactNode
  label: string
  value: string
  onClick?: () => void
}) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      onClick={onClick}
      className={cx(
        'w-full flex items-center gap-3 px-4 h-14 rounded-era era-bevel bg-era-surface',
        onClick && 'cursor-pointer hover:bg-era-surface-alt transition-colors text-left'
      )}
    >
      <span className="text-era-accent-solid">{icon}</span>
      <span className="flex-1 font-body text-[15px] text-era-text">{label}</span>
      <span className="text-[13px] text-era-text-muted font-body truncate max-w-[50%] text-right">
        {value}
      </span>
      {onClick && <ChevronRight size={18} className="text-era-text-muted shrink-0" />}
    </Comp>
  )
}

function InstallSection() {
  const { canInstall, installed, promptInstall } = useInstallPrompt()
  const [iosHelp, setIosHelp] = useState(false)

  // Detect iOS Safari (no beforeinstallprompt; install via Share menu)
  const isIOS =
    typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !/crios|fxios/i.test(navigator.userAgent)

  if (installed) {
    return (
      <section className="px-4 mt-6">
        <SettingRow icon={<Check size={18} />} label="Install app" value="Installed" />
      </section>
    )
  }

  if (canInstall) {
    return (
      <section className="px-4 mt-6">
        <SettingRow
          icon={<Download size={18} />}
          label="Install app"
          value="Available"
          onClick={() => promptInstall()}
        />
      </section>
    )
  }

  if (isIOS) {
    return (
      <section className="px-4 mt-6">
        <SettingRow
          icon={<Share size={18} />}
          label="Install app"
          value="Via Share menu"
          onClick={() => setIosHelp((v) => !v)}
        />
        {iosHelp && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 era-surface p-4"
          >
            <p className="font-body text-[14px] text-era-text leading-relaxed">
              To install AKOUSTIX on iPhone/iPad:
            </p>
            <ol className="mt-2 space-y-1.5 text-[13px] text-era-text-muted font-body leading-relaxed list-decimal pl-5">
              <li>Tap the <span className="text-era-text">Share</span> button in Safari’s toolbar.</li>
              <li>Choose <span className="text-era-text">Add to Home Screen</span>.</li>
              <li>Tap <span className="text-era-text">Add</span> — AKOUSTIX launches full-screen from your home screen.</li>
            </ol>
          </motion.div>
        )}
      </section>
    )
  }

  // Browser doesn’t support install (e.g. desktop non-Chromium) — hide the row.
  return null
}
