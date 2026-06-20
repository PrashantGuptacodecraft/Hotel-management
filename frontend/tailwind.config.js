/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050810',
          900: '#0A0F1C',
          800: '#0F1629',
          700: '#141B2D',
          600: '#1A2340',
          500: '#1E2A45',
          400: '#243352',
        },
        gold: {
          300: '#F0D060',
          400: '#E5C340',
          500: '#D4AF37',
          600: '#B8962E',
          700: '#9C7D25',
        },
        electric: {
          300: '#66E8FF',
          400: '#33DBFF',
          500: '#00D4FF',
          600: '#00BBDF',
          700: '#009EBF',
        },
        emerald: {
          hotel: '#00E5A0',
        },
        success: '#00E5A0',
        warning: '#FF9500',
        danger: '#FF3B5C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #F0D060 50%, #D4AF37 100%)',
        'navy-gradient': 'linear-gradient(135deg, #0A0F1C 0%, #141B2D 100%)',
        'electric-gradient': 'linear-gradient(135deg, #00D4FF 0%, #0066FF 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      },
      boxShadow: {
        'gold': '0 0 30px rgba(212, 175, 55, 0.2)',
        'electric': '0 0 30px rgba(0, 212, 255, 0.15)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(0, 212, 255, 0.1)',
        'glow-gold': '0 0 60px rgba(212, 175, 55, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
        'shimmer': 'shimmer 2s infinite',
        'counter': 'counter 1.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.5)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
