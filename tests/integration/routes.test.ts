import { describe, expect, it } from 'vitest';
import { isSafeRedirect } from '@/lib/security/headers';
describe('route security helpers', () => {
  it('allows local redirects only', () => {
    expect(isSafeRedirect('/app')).toBe(true);
    expect(isSafeRedirect('//evil.test')).toBe(false);
  });
});
