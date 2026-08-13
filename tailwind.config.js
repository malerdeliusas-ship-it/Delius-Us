/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep navy – headings, footer, primary text
        navy: {
          DEFAULT: '#16234D',
          950: '#0C1430',
          900: '#101B3D',
          800: '#16234D',
          700: '#1E2C63',
          600: '#273a7f',
        },
        // Royal / brand blue – H2, "why choose us" panel, step buttons
        royal: {
          DEFAULT: '#2E44B8',
          light: '#4C63D2',
          lighter: '#7C93E8',
        },
        // Warm gold – CTAs, accents, badges
        gold: {
          DEFAULT: '#F6B21B',
          dark: '#E29D0B',
          light: '#FBC64D',
        },
        // Cream / beige – hero + soft sections
        cream: {
          DEFAULT: '#FCF4E4',
          dark: '#F7EAD0',
        },
        // Peach – service & portfolio cards
        peach: {
          DEFAULT: '#FBE3BC',
          light: '#FDEFD6',
          dark: '#F7C877',
        },
        ink: '#5B6472', // muted body text
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(22, 35, 77, 0.18)',
        soft: '0 8px 24px -14px rgba(22, 35, 77, 0.25)',
      },
      maxWidth: {
        container: '1200px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
      },
    },
  },
  plugins: [],
}
