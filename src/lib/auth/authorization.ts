import 'server-only';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTestAuthenticatedUser } from '@/lib/auth/test-auth';
import { hasPermission, type Permission } from './permissions';

export async function getCurrentUser() {
  const testUser = await getTestAuthenticatedUser();
  if (testUser) return testUser;
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');
  return user;
}

export async function requirePermission(permission: Permission) {
  const user = await requireAuthenticatedUser();
  if (!hasPermission(user.roles, permission)) redirect('/unauthorized');
  return user;
}

export async function requireAdministratorAccess() {
  return requirePermission('admin:access');
}
