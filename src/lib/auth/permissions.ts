export const roles = [
  'OWNER',
  'ADMINISTRATOR',
  'MANAGER',
  'EMPLOYEE',
  'CARD_SHOW_VENDOR',
  'CONSIGNOR',
  'CUSTOMER',
] as const;
export type Role = (typeof roles)[number];
export const permissions = [
  'dashboard:access',
  'admin:access',
  'users:manage',
  'system:settings',
  'catalog:read',
  'inventory:read',
  'cost:read',
] as const;
export type Permission = (typeof permissions)[number];
export const rolePermissions: Record<Role, readonly Permission[]> = {
  OWNER: permissions,
  ADMINISTRATOR: permissions,
  MANAGER: ['dashboard:access', 'catalog:read', 'inventory:read', 'cost:read'],
  EMPLOYEE: ['dashboard:access', 'catalog:read', 'inventory:read'],
  CARD_SHOW_VENDOR: ['dashboard:access', 'catalog:read', 'inventory:read'],
  CONSIGNOR: [],
  CUSTOMER: [],
};
export function hasPermission(
  userRoles: readonly Role[],
  permission: Permission,
) {
  return userRoles.some((role) => rolePermissions[role]?.includes(permission));
}
