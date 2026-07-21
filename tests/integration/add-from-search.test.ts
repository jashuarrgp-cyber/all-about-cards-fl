import { PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it } from 'vitest';
import { addCardFromSearch } from '@/lib/collection/add-from-search-service';

// Requires a real PostgreSQL connection — runs in CI, not in a sandbox
// without a database. Mirrors the reset/base pattern already used by
// tests/integration/inventory.test.ts.

const prisma = new PrismaClient();
async function reset() {
  await prisma.inventoryMovement.deleteMany();
  await prisma.quantityInventoryLot.deleteMany();
  await prisma.catalogProduct.deleteMany();
  await prisma.storageLocation.deleteMany();
  await prisma.auditLog.deleteMany();
}
async function baseUser() {
  return prisma.user.create({
    data: { email: `${crypto.randomUUID()}@example.test` },
  });
}

beforeEach(reset);

describe('addCardFromSearch', () => {
  it('creates a catalog product, a default location, and a quantity lot', async () => {
    const user = await baseUser();

    const result = await addCardFromSearch(
      prisma,
      {
        externalId: 'swsh7-8',
        name: 'Pikachu',
        setName: 'Evolving Skies',
        cardNumber: '8',
        rarity: 'Common',
        quantity: 3,
        acquisitionUnitCost: '2.50',
      },
      user.id,
    );

    const product = await prisma.catalogProduct.findUniqueOrThrow({
      where: { id: result.productId },
    });
    expect(product.name).toBe('Pikachu');
    expect(product.game).toBe('POKEMON');
    expect(product.externalReferences).toMatchObject({
      pokemonTcgId: 'swsh7-8',
    });

    const lot = await prisma.quantityInventoryLot.findUniqueOrThrow({
      where: { id: result.lotId },
    });
    expect(lot.quantityOnHand).toBe(3);
    expect(lot.acquisitionUnitCost.toString()).toBe('2.5000');
    expect(lot.ownershipType).toBe('COMPANY');

    const movement = await prisma.inventoryMovement.findFirstOrThrow({
      where: { quantityInventoryLotId: lot.id },
    });
    expect(movement.quantityDelta).toBe(3);
    expect(movement.actingUserId).toBe(user.id);

    const location = await prisma.storageLocation.findFirstOrThrow();
    expect(location.code).toBe('GENERAL');

    const audit = await prisma.auditLog.findFirstOrThrow({
      where: { action: 'inventory.search.add' },
    });
    expect(audit.entityId).toBe(lot.id);
  });

  it('reuses the same catalog product and location on a second add', async () => {
    const user = await baseUser();

    const first = await addCardFromSearch(
      prisma,
      {
        externalId: 'swsh7-8',
        name: 'Pikachu',
        setName: 'Evolving Skies',
        quantity: 1,
        acquisitionUnitCost: '',
      },
      user.id,
    );
    const second = await addCardFromSearch(
      prisma,
      {
        externalId: 'swsh7-8',
        name: 'Pikachu',
        setName: 'Evolving Skies',
        quantity: 2,
        acquisitionUnitCost: '',
      },
      user.id,
    );

    expect(second.productId).toBe(first.productId);

    const locations = await prisma.storageLocation.findMany();
    expect(locations).toHaveLength(1);

    const lots = await prisma.quantityInventoryLot.findMany({
      where: { productId: first.productId },
    });
    expect(lots).toHaveLength(2);
  });

  it('defaults a blank cost to zero rather than guessing', async () => {
    const user = await baseUser();

    const result = await addCardFromSearch(
      prisma,
      {
        externalId: 'base1-4',
        name: 'Charizard',
        setName: 'Base',
        quantity: 1,
        acquisitionUnitCost: '',
      },
      user.id,
    );

    const lot = await prisma.quantityInventoryLot.findUniqueOrThrow({
      where: { id: result.lotId },
    });
    expect(lot.acquisitionUnitCost.toString()).toBe('0.0000');
  });
});
