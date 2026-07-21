import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Vitest's esbuild transform doesn't read the app's "jsx: preserve"
  // tsconfig setting; without this, any test that renders a component (not
  // just tests of plain functions) fails with "React is not defined".
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'server-only': path.resolve(__dirname, 'tests/setup/server-only.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    exclude: ['node_modules', '.next', 'tests/e2e/**'],
    globals: true,
    setupFiles: ['tests/setup/env.ts'],
  },
});
