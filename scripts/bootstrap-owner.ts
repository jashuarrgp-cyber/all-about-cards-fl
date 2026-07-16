import { PrismaClient } from '@prisma/client';
import { ownerBootstrapSchema } from '../src/lib/validation/auth';
const prisma = new PrismaClient();
async function main() {
  const input = ownerBootstrapSchema.parse({
    email: process.env.INITIAL_OWNER_EMAIL,
    confirmation: process.env.INITIAL_OWNER_CONFIRMATION,
  });
  const owner = await prisma.role.findUnique({ where: { name: 'OWNER' } });
  if (!owner) throw new Error('Run npm run db:seed before owner bootstrap.');
  const existing = await prisma.userRole.findFirst({
    where: { roleId: owner.id },
  });
  if (existing)
    throw new Error(
      'Owner already assigned; refusing to assign another initial owner.',
    );
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new Error('Create the user by signing in before promotion.');
  await prisma.userRole.create({ data: { userId: user.id, roleId: owner.id } });
}
main().finally(() => prisma.$disconnect());
