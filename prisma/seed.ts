import { PrismaClient } from '@prisma/client';
import { rolePermissions } from '../src/lib/auth/permissions';
const prisma = new PrismaClient();
async function main() {
  for (const [role, perms] of Object.entries(rolePermissions)) {
    const dbRole = await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
    for (const perm of perms) {
      const dbPerm = await prisma.permission.upsert({
        where: { name: perm },
        update: {},
        create: { name: perm },
      });
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: dbRole.id, permissionId: dbPerm.id },
        },
        update: {},
        create: { roleId: dbRole.id, permissionId: dbPerm.id },
      });
    }
  }
}
main().finally(() => prisma.$disconnect());
