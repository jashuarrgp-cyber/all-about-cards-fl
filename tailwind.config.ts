import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: { colors: { ink: '#111827', gold: '#c89b3c' } } },
  plugins: [],
} satisfies Config;
