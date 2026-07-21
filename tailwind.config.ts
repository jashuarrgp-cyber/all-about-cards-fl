import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        gold: '#c89b3c',
        // Collector UI palette (mobile app experience)
        base: {
          950: '#05070a',
          900: '#0a0d12',
          800: '#11151c',
          700: '#171c25',
        },
        brand: {
          green: '#34e08f',
          teal: '#22d3b7',
          up: '#3fe08f',
          down: '#ff5d6c',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
