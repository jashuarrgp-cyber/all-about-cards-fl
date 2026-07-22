import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        gold: '#c89b3c',
        // Collector UI palette (mobile app experience) — Miami Vice-inspired:
        // deep purple-black night backdrop, hot pink primary accent, neon
        // green/coral for gains/losses.
        base: {
          950: '#0a0616',
          900: '#130c22',
          800: '#1e1333',
          700: '#2c1c49',
        },
        brand: {
          green: '#00f5a0',
          pink: '#ff2e9f',
          up: '#00f5a0',
          down: '#ff3b5c',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
