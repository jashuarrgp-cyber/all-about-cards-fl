import type { PrismaClient } from '@prisma/client';
import { rolePermissions } from '../src/lib/auth/permissions';

// Roles and permissions only — the part of setup that a real production
// database needs. Deliberately free of any sample business data, so it is
// safe to run against the live database. Idempotent (all upserts), so
// re-running it never duplicates or overwrites anything.
export async function seedRolesAndPermissions(
  client: Pick<PrismaClient, 'role' | 'permission' | 'rolePermission'>,
) {
  for (const [role, perms] of Object.entries(rolePermissions)) {
    const dbRole = await client.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
    for (const perm of perms) {
      const dbPerm = await client.permission.upsert({
        where: { name: perm },
        update: {},
        create: { name: perm },
      });
      await client.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: dbRole.id, permissionId: dbPerm.id },
        },
        update: {},
        create: { roleId: dbRole.id, permissionId: dbPerm.id },
      });
    }
  }
}
