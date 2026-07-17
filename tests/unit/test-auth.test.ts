import { describe, expect, it, vi } from 'vitest';
import { getTestIdentity, isTestAuthEnabled } from '@/lib/auth/test-auth';

describe('production-safe test authentication guard', () => {
  it('requires TEST_ENV=true', () => {
    vi.stubEnv('TEST_ENV', 'false');
    vi.stubEnv('NODE_ENV', 'test');
    expect(isTestAuthEnabled()).toBe(false);
  });

  it('refuses to activate in production', () => {
    vi.stubEnv('TEST_ENV', 'true');
    vi.stubEnv('NODE_ENV', 'production');
    expect(isTestAuthEnabled()).toBe(false);
  });

  it('allows only fixed known identities', () => {
    expect(getTestIdentity('owner')?.roles).toEqual(['OWNER']);
    expect(getTestIdentity('employee')?.roles).toEqual(['EMPLOYEE']);
    expect(getTestIdentity('CARD_SHOW_VENDOR')).toBeNull();
    expect(getTestIdentity('{"roles":["OWNER"]}')).toBeNull();
  });
});
