import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================================
// useInstallPrompt — captures the deferred `beforeinstallprompt`
// event (Chrome/Edge/Android) and exposes a trigger + install
// state. iOS Safari doesn't fire this event (users install via
// Share → Add to Home Screen), so we detect standalone mode to
// hide the prompt there once installed.
// ============================================================

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: BeforeInstallPromptEvent | null = null

export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Already installed (standalone display mode)?
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    if (standalone) {
      setInstalled(true)
      return
    }

    const onBIP = (e: Event) => {
      e.preventDefault()
      deferred = e as BeforeInstallPromptEvent
      setCanInstall(true)
    }
    const onInstalled = () => {
      setInstalled(true)
      setCanInstall(false)
      deferred = null
    }

    window.addEventListener('beforeinstallprompt', onBIP)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const promptInstall = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferred) return 'unavailable'
    await deferred.prompt()
    const choice = await deferred.userChoice
    deferred = null
    setCanInstall(false)
    return choice.outcome
  }

  const dismiss = () => {
    setCanInstall(false)
    // Remember dismissal for this session so the banner stays quiet.
    try {
      sessionStorage.setItem('akx-install-dismissed', '1')
    } catch {
      /* ignore */
    }
  }

  return { canInstall, installed, promptInstall, dismiss }
}

// ============================================================
// InstallBanner — dismissable bottom banner that appears when
// the browser signals installability. Mounted once in AppShell.
// ============================================================

export function InstallBanner() {
  const { canInstall, promptInstall, dismiss } = useInstallPrompt()
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem('akx-install-dismissed') === '1') setHidden(true)
    } catch {
      /* ignore */
    }
  }, [])

  return (
    <AnimatePresence>
      {canInstall && !hidden && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="fixed bottom-20 left-2 right-2 z-40 mx-auto max-w-[472px]"
        >
          <div className="era-bevel rounded-era bg-era-surface p-3 flex items-center gap-3 shadow-era">
            <div className="w-11 h-11 rounded-eraPill era-bevel bg-era-accent-solid text-era-accent-contrast flex items-center justify-center shrink-0">
              <Download size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[15px] text-era-text leading-tight">Install AKOUSTIX</p>
              <p className="text-[12px] text-era-text-muted leading-tight">Add to your home screen for the full-screen experience.</p>
            </div>
            <button
              onClick={async () => {
                await promptInstall()
                setHidden(true)
              }}
              className="era-bevel rounded-era bg-era-accent-solid text-era-accent-contrast h-9 px-3 text-[13px] font-body shrink-0"
            >
              Install
            </button>
            <button
              aria-label="Dismiss"
              onClick={() => {
                dismiss()
                setHidden(true)
              }}
              className="w-8 h-8 rounded-eraPill text-era-text-muted hover:text-era-text inline-flex items-center justify-center shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
