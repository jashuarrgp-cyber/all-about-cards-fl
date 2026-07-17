import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const product = await prisma.catalogProduct.findUnique({
    where: { id: '00000000-0000-4000-8000-000000000101' },
    select: { id: true, name: true, archivedAt: true },
  });
  if (!product) {
    throw new Error('Missing seeded catalog product for Playwright.');
  }
  if (product.name !== 'Synthetic Electric Mouse') {
    throw new Error(
      'Seeded catalog product name does not match Playwright expectations.',
    );
  }
  if (product.archivedAt) {
    throw new Error(
      'Seeded catalog product is archived and hidden by active filters.',
    );
  }

  const lot = await prisma.quantityInventoryLot.findUnique({
    where: { id: '00000000-0000-4000-8000-000000000301' },
    select: {
      id: true,
      productId: true,
      acquisitionUnitCost: true,
      archivedAt: true,
    },
  });
  if (!lot) {
    throw new Error('Missing seeded quantity inventory lot for Playwright.');
  }
  if (lot.productId !== product.id) {
    throw new Error(
      'Seeded quantity lot is not attached to the Playwright product.',
    );
  }
  if (!lot.acquisitionUnitCost) {
    throw new Error('Seeded quantity lot is missing acquisition unit cost.');
  }
  if (lot.archivedAt) {
    throw new Error('Seeded quantity lot is archived.');
  }

  const ownerCostPermission = await prisma.rolePermission.findFirst({
    where: { role: { name: 'OWNER' }, permission: { name: 'cost:read' } },
    select: { roleId: true },
  });
  if (!ownerCostPermission) {
    throw new Error('OWNER role is missing cost:read permission.');
  }

  console.log('Verified deterministic Phase 3A Playwright seed data.');
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
