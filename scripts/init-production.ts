import { PrismaClient } from '@prisma/client';
import { seedRolesAndPermissions } from '../prisma/roles-seed';

// One-time (safe to repeat) production database setup: creates the roles and
// permissions the app needs, and nothing else — no sample cards, purchases,
// or inventory. Run this once against the live database after migrations, so
// sign-in and the owner bootstrap have the roles they depend on.
//
//   DATABASE_URL="<your production database url>" npm run prod:init
const prisma = new PrismaClient();

async function main() {
  await seedRolesAndPermissions(prisma);
  console.log('Roles and permissions are set up. Safe to run again anytime.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
