import { PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  adjustQuantityInventory,
  receivePurchaseIntoInventory,
  receiveSerializedItem,
  releaseReservedQuantity,
  reserveQuantity,
  transferQuantityInventory,
} from '@/lib/inventory/service';
import { seed } from '../../prisma/seed';

const prisma = new PrismaClient();
async function reset() {
  await prisma.inventoryMovement.deleteMany();
  await prisma.individualInventoryItem.deleteMany();
  await prisma.quantityInventoryLot.deleteMany();
  await prisma.purchaseLine.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.catalogProduct.deleteMany();
  await prisma.storageLocation.deleteMany();
  await prisma.consignor.deleteMany();
  await prisma.auditLog.deleteMany();
}
async function base() {
  const loc = await prisma.storageLocation.create({
    data: { code: crypto.randomUUID(), name: 'Test shelf' },
  });
  const loc2 = await prisma.storageLocation.create({
    data: { code: crypto.randomUUID(), name: 'Test case' },
  });
  const product = await prisma.catalogProduct.create({
    data: { game: 'POKEMON', productType: 'RAW_CARD', name: 'Test Card' },
  });
  return { loc, loc2, product };
}

beforeEach(reset);

describe('Phase 2 inventory services', () => {
  it('receives a purchase atomically with inventory, movement, and audit records', async () => {
    const { loc, product } = await base();
    const purchase = await receivePurchaseIntoInventory(prisma, {
      purchaseDate: new Date(),
      sourceName: 'Test seller',
      currency: 'USD',
      subtotal: '10.00',
      tax: '0.00',
      shipping: '0.00',
      fees: '0.00',
      totalCost: '10.00',
      locationId: loc.id,
      lines: [
        {
          productId: product.id,
          quantity: 2,
          unitCost: '5.0000',
          lineTotal: '10.00',
          inventoryType: 'QUANTITY',
        },
      ],
    });
    expect(
      await prisma.purchaseLine.count({ where: { purchaseId: purchase.id } }),
    ).toBe(1);
    expect(await prisma.quantityInventoryLot.count()).toBe(1);
    expect(await prisma.inventoryMovement.count()).toBe(1);
    expect(
      await prisma.auditLog.count({ where: { entityType: 'Purchase' } }),
    ).toBe(1);
  });
  it('prevents negative and over-reserved quantity', async () => {
    const { loc, product } = await base();
    const lot = await prisma.quantityInventoryLot.create({
      data: {
        productId: product.id,
        ownershipType: 'COMPANY',
        locationId: loc.id,
        quantityOnHand: 3,
        acquisitionUnitCost: '1.0000',
      },
    });
    await expect(
      adjustQuantityInventory(prisma, {
        lotId: lot.id,
        quantityDelta: -4,
        movementType: 'MANUAL_ADJUSTMENT_OUT',
      }),
    ).rejects.toThrow();
    await expect(
      reserveQuantity(prisma, { lotId: lot.id, quantity: 4 }),
    ).rejects.toThrow();
  });
  it('rolls back failed purchases', async () => {
    await expect(
      receivePurchaseIntoInventory(prisma, {
        purchaseDate: new Date(),
        sourceName: 'Bad',
        currency: 'USD',
        subtotal: '1.00',
        totalCost: '1.00',
        lines: [],
      }),
    ).rejects.toThrow();
    expect(await prisma.purchase.count()).toBe(0);
    expect(await prisma.inventoryMovement.count()).toBe(0);
  });
  it('transfers inventory and writes movement history', async () => {
    const { loc, loc2, product } = await base();
    const lot = await prisma.quantityInventoryLot.create({
      data: {
        productId: product.id,
        ownershipType: 'COMPANY',
        locationId: loc.id,
        quantityOnHand: 5,
        acquisitionUnitCost: '1.0000',
      },
    });
    const target = await transferQuantityInventory(prisma, {
      lotId: lot.id,
      toLocationId: loc2.id,
      quantity: 2,
    });
    expect(target.locationId).toBe(loc2.id);
    expect(
      await prisma.inventoryMovement.count({
        where: { movementType: 'TRANSFER' },
      }),
    ).toBe(1);
  });
  it('enforces unique grading certification and ownership constraints', async () => {
    const { loc, product } = await base();
    await receiveSerializedItem(prisma, {
      productId: product.id,
      ownershipType: 'COMPANY',
      locationId: loc.id,
      acquisitionCost: '9.0000',
      gradingCompany: 'PSA',
      certificationNumber: '123',
    });
    await expect(
      receiveSerializedItem(prisma, {
        productId: product.id,
        ownershipType: 'COMPANY',
        locationId: loc.id,
        acquisitionCost: '9.0000',
        gradingCompany: 'PSA',
        certificationNumber: '123',
      }),
    ).rejects.toThrow();
    await expect(
      prisma.quantityInventoryLot.create({
        data: {
          productId: product.id,
          ownershipType: 'CONSIGNMENT',
          locationId: loc.id,
          quantityOnHand: 1,
          acquisitionUnitCost: '1.0000',
        },
      }),
    ).rejects.toThrow();
    const consignor = await prisma.consignor.create({
      data: { displayName: 'Tester' },
    });
    await expect(
      prisma.quantityInventoryLot.create({
        data: {
          productId: product.id,
          ownershipType: 'COMPANY',
          consignorId: consignor.id,
          locationId: loc.id,
          quantityOnHand: 1,
          acquisitionUnitCost: '1.0000',
        },
      }),
    ).rejects.toThrow();
  });
  it('preserves cost basis and seed is idempotent', async () => {
    await seed(prisma);
    await seed(prisma);
    expect(
      await prisma.quantityInventoryLot.count({
        where: { id: '00000000-0000-4000-8000-000000000301' },
      }),
    ).toBe(1);
    const lot = await prisma.quantityInventoryLot.findFirstOrThrow();
    await prisma.catalogProduct.update({
      where: { id: lot.productId },
      data: { name: 'Edited Name' },
    });
    expect(
      (
        await prisma.quantityInventoryLot.findUniqueOrThrow({
          where: { id: lot.id },
        })
      ).acquisitionUnitCost.toString(),
    ).toBe(lot.acquisitionUnitCost.toString());
  });
  it('does not over-reserve during concurrent requests', async () => {
    const { loc, product } = await base();
    const lot = await prisma.quantityInventoryLot.create({
      data: {
        productId: product.id,
        ownershipType: 'COMPANY',
        locationId: loc.id,
        quantityOnHand: 1,
        acquisitionUnitCost: '1.0000',
      },
    });
    const results = await Promise.allSettled([
      reserveQuantity(prisma, { lotId: lot.id, quantity: 1 }),
      reserveQuantity(prisma, { lotId: lot.id, quantity: 1 }),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    await releaseReservedQuantity(prisma, { lotId: lot.id, quantity: 1 });
  });
});

describe('Phase 3A read-only catalog and inventory queries', () => {
  it('searches, filters, paginates catalog, and loads stable id detail', async () => {
    await seed(prisma);
    const { listCatalogProducts, getCatalogProductDetail } = await import(
      '@/lib/catalog/queries'
    );
    expect(
      (await listCatalogProducts({ q: 'Electric' })).items[0].name,
    ).toContain('Electric');
    expect(
      (await listCatalogProducts({ game: 'ONE_PIECE' })).items.every(
        (p) => p.game === 'ONE_PIECE',
      ),
    ).toBe(true);
    const page = await listCatalogProducts({ page: '1', pageSize: '10' });
    expect(page.items.length).toBeLessThanOrEqual(10);
    expect(
      await getCatalogProductDetail('00000000-0000-4000-8000-000000000101'),
    ).toMatchObject({ id: '00000000-0000-4000-8000-000000000101' });
  });
  it('filters inventory and protects cost fields by permission-aware selection', async () => {
    await seed(prisma);
    const { listInventory, getIndividualItemDetail, getQuantityLotDetail } =
      await import('@/lib/inventory/queries');
    const all = await listInventory({}, false);
    expect(all.lotTotal).toBeGreaterThan(0);
    expect(all.itemTotal).toBeGreaterThan(0);
    expect(all.lots[0]).not.toHaveProperty('acquisitionUnitCost');
    expect(all.items[0]).not.toHaveProperty('acquisitionCost');
    expect(
      (await listInventory({ type: 'quantity' }, true)).items,
    ).toHaveLength(0);
    expect(
      (await listInventory({ type: 'individual' }, true)).lots,
    ).toHaveLength(0);
    expect(
      (await listInventory({ ownershipType: 'CONSIGNMENT' }, true)).items[0]
        .consignor?.displayName,
    ).toBe('Synthetic Demo Consignor');
    const byLocation = await listInventory(
      { locationId: all.locations[0].id },
      true,
    );
    expect(byLocation.total).toBeGreaterThanOrEqual(0);
    expect(
      await getQuantityLotDetail('00000000-0000-4000-8000-000000000301', true),
    ).toHaveProperty('acquisitionUnitCost');
    expect(
      await getIndividualItemDetail(
        all.items[0]?.id ??
          (await listInventory({ type: 'individual' }, true)).items[0].id,
        true,
      ),
    ).toHaveProperty('acquisitionCost');
  });
  it('preserves exact BAM consignor display when present', async () => {
    const { loc, product } = await base();
    const bam = await prisma.consignor.create({ data: { displayName: 'BAM' } });
    await prisma.individualInventoryItem.create({
      data: {
        productId: product.id,
        ownershipType: 'CONSIGNMENT',
        consignorId: bam.id,
        locationId: loc.id,
        acquisitionCost: '1.0000',
        internalInventoryId: 'BAM-1',
      },
    });
    const { listInventory } = await import('@/lib/inventory/queries');
    expect(
      (await listInventory({ q: 'BAM' }, true)).items[0].consignor?.displayName,
    ).toBe('BAM');
  });
});
