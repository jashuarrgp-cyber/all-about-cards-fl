import 'server-only';
import { cookies } from 'next/headers';
import type { Role } from '@/lib/auth/permissions';

export const testIdentityCookieName = 'aacfl_test_identity';

const testIdentities = {
  owner: {
    id: '00000000-0000-4000-8000-00000000a001',
    email: 'test-owner@example.test',
    name: 'Test Owner',
    roles: ['OWNER'] as Role[],
  },
  employee: {
    id: '00000000-0000-4000-8000-00000000a002',
    email: 'test-employee@example.test',
    name: 'Test Employee',
    roles: ['EMPLOYEE'] as Role[],
  },
  vendor: {
    id: '00000000-0000-4000-8000-00000000a003',
    email: 'test-vendor@example.test',
    name: 'Test Card Show Vendor',
    roles: ['CARD_SHOW_VENDOR'] as Role[],
  },
  customer: {
    id: '00000000-0000-4000-8000-00000000a004',
    email: 'test-customer@example.test',
    name: 'Test Customer',
    roles: ['CUSTOMER'] as Role[],
  },
} as const;

export type TestIdentityKey = keyof typeof testIdentities;

export function isTestAuthEnabled() {
  return (
    process.env.TEST_ENV === 'true' && process.env.NODE_ENV !== 'production'
  );
}

export function getTestIdentity(identity: string | undefined) {
  if (!identity || !(identity in testIdentities)) return null;
  return testIdentities[identity as TestIdentityKey];
}

export async function getTestAuthenticatedUser() {
  if (!isTestAuthEnabled()) return null;
  const cookieStore = await cookies();
  const identity = cookieStore.get(testIdentityCookieName)?.value;
  const testIdentity = getTestIdentity(identity);
  if (!testIdentity) return null;
  return { ...testIdentity, image: null };
}
