import { describe, expect, it } from 'vitest';
import { hasPermission, roles, permissions } from '@/lib/auth/permissions';
describe('permissions', () => {
  it('defines expected roles and permissions', () => {
    expect(roles).toContain('OWNER');
    expect(permissions).toContain('admin:access');
  });
  it('grants owner admin access but not customer', () => {
    expect(hasPermission(['OWNER'], 'admin:access')).toBe(true);
    expect(hasPermission(['CUSTOMER'], 'admin:access')).toBe(false);
  });
});
