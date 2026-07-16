import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#04020e',
        rose: {
          DEFAULT: '#e8557a',
          dark: '#c03060',
        },
        gold: {
          DEFAULT: '#c9a96e',
          dark: '#a07438',
        },
        violet: '#7030c0',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-rose': 'linear-gradient(135deg, #e8557a, #c03060)',
        'gradient-gold': 'linear-gradient(135deg, #c9a96e, #a07438)',
        'gradient-hero': 'linear-gradient(140deg, #fff 0%, #f5d0dc 35%, #c9a96e 70%, #fff 100%)',
      },
      animation: {
        'scroll-dot': 'scrollDot 2s ease-in-out infinite',
        'heartbeat': 'heartbeat 1s ease-in-out infinite',
        'ring-pulse': 'ringPulse 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.45s ease forwards',
      },
      keyframes: {
        scrollDot: {
          '0%, 100%': { transform: 'translateX(-50%) translateY(0)', opacity: '0.8' },
          '50%': { transform: 'translateX(-50%) translateY(7px)', opacity: '0.2' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.18)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.1)' },
          '56%': { transform: 'scale(1)' },
        },
        ringPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.1)', opacity: '0.3' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'rose-glow': '0 4px 40px rgba(232,85,122,0.4)',
        'rose-glow-lg': '0 8px 60px rgba(232,85,122,0.6)',
        'gold-glow': '0 4px 35px rgba(201,169,110,0.45)',
        'gold-glow-lg': '0 8px 55px rgba(201,169,110,0.65)',
      },
    },
  },
  plugins: [],
}

export default config
