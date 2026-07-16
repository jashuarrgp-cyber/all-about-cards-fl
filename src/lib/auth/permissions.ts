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
] as const;
export type Permission = (typeof permissions)[number];
export const rolePermissions: Record<Role, readonly Permission[]> = {
  OWNER: permissions,
  ADMINISTRATOR: [
    'dashboard:access',
    'admin:access',
    'users:manage',
    'system:settings',
  ],
  MANAGER: ['dashboard:access'],
  EMPLOYEE: ['dashboard:access'],
  CARD_SHOW_VENDOR: ['dashboard:access'],
  CONSIGNOR: ['dashboard:access'],
  CUSTOMER: ['dashboard:access'],
};
export function hasPermission(
  userRoles: readonly Role[],
  permission: Permission,
) {
  return userRoles.some((role) => rolePermissions[role]?.includes(permission));
}
