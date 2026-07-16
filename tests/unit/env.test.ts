import { describe, expect, it } from 'vitest';
import { serverEnvSchema } from '@/lib/env/server';
describe('server env', () => {
  it('rejects short secrets', () => {
    expect(() =>
      serverEnvSchema.parse({
        APP_URL: 'http://localhost:3000',
        DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
        AUTH_SECRET: 'short',
      }),
    ).toThrow();
  });
});
