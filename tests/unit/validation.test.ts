import { describe, expect, it } from 'vitest';
import { ownerBootstrapSchema, signInSchema } from '@/lib/validation/auth';
describe('auth validation', () => {
  it('requires intentional owner confirmation', () => {
    expect(
      ownerBootstrapSchema.parse({
        email: 'owner@example.test',
        confirmation: 'PROMOTE_INITIAL_OWNER',
      }).email,
    ).toBe('owner@example.test');
  });
  it('rejects unsafe callback', () => {
    expect(() => signInSchema.parse({ callbackUrl: '/local' })).toThrow();
  });
});
