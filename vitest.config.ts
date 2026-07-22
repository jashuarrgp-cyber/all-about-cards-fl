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
    // Multiple integration test files share one real external Postgres
    // database and each does a blanket deleteMany() across shared tables
    // in beforeEach. Vitest runs test files concurrently by default, which
    // lets those sweeps race each other (confirmed in CI: the same two
    // files passed together in one run's "npm test" step and failed with
    // foreign-key/concurrent-update errors in that same run's separate
    // "npm run test:integration" step). Forcing sequential file execution
    // removes the race for good, for this pair and any future integration
    // test file.
    fileParallelism: false,
  },
});
