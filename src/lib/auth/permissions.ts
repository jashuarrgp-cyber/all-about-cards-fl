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
  'catalog:manage',
  'inventory:read',
  'inventory:receive',
  'inventory:adjust',
  'inventory:transfer',
  'inventory:reserve',
  'purchases:read',
  'purchases:create',
  'locations:read',
  'locations:manage',
  'movements:read',
  'audit:read',
  'cost:read',
] as const;
export type Permission = (typeof permissions)[number];
const internalOperationalPermissions = [
  'dashboard:access',
  'catalog:read',
  'catalog:manage',
  'inventory:read',
  'inventory:receive',
  'inventory:adjust',
  'inventory:transfer',
  'inventory:reserve',
  'purchases:read',
  'purchases:create',
  'locations:read',
  'locations:manage',
  'movements:read',
  'audit:read',
  'cost:read',
] as const satisfies readonly Permission[];
export const rolePermissions: Record<Role, readonly Permission[]> = {
  OWNER: permissions,
  ADMINISTRATOR: permissions,
  MANAGER: internalOperationalPermissions,
  EMPLOYEE: [
    'dashboard:access',
    'catalog:read',
    'inventory:read',
    'inventory:transfer',
    'locations:read',
    'movements:read',
  ],
  CARD_SHOW_VENDOR: [
    'dashboard:access',
    'catalog:read',
    'inventory:read',
    'locations:read',
  ],
  CONSIGNOR: [],
  CUSTOMER: [],
};
export function hasPermission(
  userRoles: readonly Role[],
  permission: Permission,
) {
  return userRoles.some((role) => rolePermissions[role]?.includes(permission));
}
