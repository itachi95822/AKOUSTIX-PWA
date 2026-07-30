/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Era tokens are driven by CSS variables defined per-era on :root.
        // These map to the current era's palette so components stay era-agnostic.
        era: {
          bg: 'var(--era-bg)',
          surface: 'var(--era-surface)',
          surfaceAlt: 'var(--era-surface-alt)',
          raised: 'var(--era-raised)',
          text: 'var(--era-text)',
          textMuted: 'var(--era-text-muted)',
          accent: 'var(--era-accent)',
          accentSolid: 'var(--era-accent-solid)',
          border: 'var(--era-border)',
          track: 'var(--era-track)'
        }
      },
      fontFamily: {
        display: ['var(--era-font-display)', 'serif'],
        body: ['var(--era-font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--era-font-mono)', 'ui-monospace', 'monospace']
      },
      borderRadius: {
        era: 'var(--era-radius)',
        eraSm: 'var(--era-radius-sm)',
        eraLg: 'var(--era-radius-lg)',
        eraPill: 'var(--era-radius-pill)'
      },
      boxShadow: {
        era: 'var(--era-shadow)',
        eraSoft: 'var(--era-shadow-soft)',
        eraInset: 'var(--era-shadow-inset)'
      },
      backgroundImage: {
        'era-grain': 'var(--era-grain)',
        'era-noise': 'var(--era-noise)'
      },
      keyframes: {
        spinSlow: { to: { transform: 'rotate(360deg)' } },
        reelSpin: { to: { transform: 'rotate(360deg)' } },
        reelSpinFast: { to: { transform: 'rotate(360deg)' } },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        vuBounce: {
          '0%,100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' }
        },
        flicker: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.92' }
        },
        sheen: {
          '0%': { transform: 'translateX(-150%) rotate(8deg)' },
          '50%': { transform: 'translateX(250%) rotate(8deg)' },
          '100%': { transform: 'translateX(250%) rotate(8deg)' }
        },
        tapeMove: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '16px 0' }
        },
        discSpin: { to: { transform: 'rotate(360deg)' } },
        waterRipple: {
          '0%': { transform: 'scale(0.6) translate(-50%,-50%)', opacity: '0.12' },
          '100%': { transform: 'scale(2.8) translate(-50%,-50%)', opacity: '0' }
        },
        waterRipple2: {
          '0%': { transform: 'scale(0.3) translate(-50%,-50%)', opacity: '0.08' },
          '100%': { transform: 'scale(3.2) translate(-50%,-50%)', opacity: '0' }
        },
        motorVibrate: {
          '0%,100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(0.5px)' },
          '75%': { transform: 'translateX(-0.5px)' }
        },
        glowPulse: {
          '0%,100%': { opacity: '0.5', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.3)' }
        },
        moonSweep: {
          '0%': { backgroundPosition: '-200% 0%' },
          '100%': { backgroundPosition: '200% 0%' }
        }
      },
      animation: {
        'spin-slow': 'spinSlow 8s linear infinite',
        'reel-spin': 'reelSpin 4s linear infinite',
        'reel-spin-fast': 'reelSpinFast 0.5s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'vu-bounce': 'vuBounce 400ms ease-in-out infinite',
        flicker: 'flicker 3s ease-in-out infinite',
        sheen: 'sheen 2.4s ease-in-out infinite',
        'tape-move': 'tapeMove 0.6s linear infinite',
        'disc-spin': 'discSpin var(--spin-dur, 4s) linear infinite',
        'water-ripple': 'waterRipple 4s ease-out infinite',
        'water-ripple-2': 'waterRipple2 5s ease-out infinite',
        'motor-vibrate': 'motorVibrate 0.06s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2.4s ease-in-out infinite',
        'moon-sweep': 'moonSweep 8s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
