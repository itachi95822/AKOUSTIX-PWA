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
        }
      },
      animation: {
        'spin-slow': 'spinSlow 8s linear infinite',
        'reel-spin': 'reelSpin 4s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'vu-bounce': 'vuBounce 400ms ease-in-out infinite',
        flicker: 'flicker 3s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
