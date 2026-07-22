import { PrismaClient } from '@prisma/client';
import { seedRolesAndPermissions } from './roles-seed';
const prisma = new PrismaClient();
export async function seed(client = prisma) {
  await seedRolesAndPermissions(client);
  const [shelf, binder, secure] = await Promise.all([
    client.storageLocation.upsert({
      where: { code: 'WH-SHELF-A1' },
      update: {},
      create: { code: 'WH-SHELF-A1', name: 'Warehouse Shelf A1' },
    }),
    client.storageLocation.upsert({
      where: { code: 'BINDER-POKEMON-01' },
      update: {},
      create: { code: 'BINDER-POKEMON-01', name: 'Pokémon Binder 01' },
    }),
    client.storageLocation.upsert({
      where: { code: 'SECURE-CASE-01' },
      update: {},
      create: { code: 'SECURE-CASE-01', name: 'Secure Display Case 01' },
    }),
  ]);
  const consignor = await client.consignor.upsert({
    where: { displayName: 'Synthetic Demo Consignor' },
    update: {},
    create: {
      displayName: 'Synthetic Demo Consignor',
      notes: 'Synthetic Phase 2 seed record.',
    },
  });
  const pikachu = await client.catalogProduct.upsert({
    where: { id: '00000000-0000-4000-8000-000000000101' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000101',
      game: 'POKEMON',
      productType: 'RAW_CARD',
      name: 'Synthetic Electric Mouse',
      setName: 'Demo Set',
      setCode: 'DMO',
      cardNumber: '001',
      language: 'EN',
    },
  });
  const luffy = await client.catalogProduct.upsert({
    where: { id: '00000000-0000-4000-8000-000000000102' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000102',
      game: 'ONE_PIECE',
      productType: 'RAW_CARD',
      name: 'Synthetic Straw Hat Captain',
      setName: 'Demo Sea',
      setCode: 'OP-DMO',
      cardNumber: '002',
      language: 'EN',
    },
  });
  const graded = await client.catalogProduct.upsert({
    where: { id: '00000000-0000-4000-8000-000000000103' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000103',
      game: 'POKEMON',
      productType: 'GRADED_CARD',
      name: 'Synthetic Graded Dragon',
      setCode: 'DMO',
      cardNumber: '006',
    },
  });
  const sealed = await client.catalogProduct.upsert({
    where: { id: '00000000-0000-4000-8000-000000000104' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000104',
      game: 'ONE_PIECE',
      productType: 'SEALED_PRODUCT',
      name: 'Synthetic Booster Box',
      manufacturer: 'Synthetic Brand',
    },
  });
  const purchase = await client.purchase.upsert({
    where: { id: '00000000-0000-4000-8000-000000000201' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000201',
      purchaseDate: new Date('2026-01-15T00:00:00Z'),
      sourceName: 'Synthetic Local Buy',
      sourceChannel: 'LOCAL',
      currency: 'USD',
      subtotal: '120.00',
      tax: '0.00',
      shipping: '0.00',
      fees: '0.00',
      totalCost: '120.00',
    },
  });
  const line = await client.purchaseLine.upsert({
    where: { id: '00000000-0000-4000-8000-000000000202' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000202',
      purchaseId: purchase.id,
      productId: pikachu.id,
      quantity: 10,
      unitCost: '2.5000',
      lineTotal: '25.00',
      inventoryType: 'QUANTITY',
    },
  });
  await client.quantityInventoryLot.upsert({
    where: { id: '00000000-0000-4000-8000-000000000301' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000301',
      productId: pikachu.id,
      ownershipType: 'COMPANY',
      locationId: shelf.id,
      quantityOnHand: 10,
      quantityReserved: 0,
      acquisitionUnitCost: '2.5000',
      purchaseLineId: line.id,
      currency: 'USD',
    },
  });
  await client.quantityInventoryLot.upsert({
    where: { id: '00000000-0000-4000-8000-000000000302' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000302',
      productId: sealed.id,
      ownershipType: 'COMPANY',
      locationId: secure.id,
      quantityOnHand: 2,
      acquisitionUnitCost: '45.0000',
      currency: 'USD',
    },
  });
  await client.individualInventoryItem.upsert({
    where: { internalInventoryId: 'DEMO-GRADED-001' },
    update: {},
    create: {
      productId: graded.id,
      ownershipType: 'CONSIGNMENT',
      consignorId: consignor.id,
      locationId: binder.id,
      acquisitionCost: '50.0000',
      currency: 'USD',
      internalInventoryId: 'DEMO-GRADED-001',
      gradingCompany: 'SYNTH',
      grade: '9.5',
      certificationNumber: 'CERT-DEMO-001',
    },
  });
  await client.catalogProduct.update({
    where: { id: luffy.id },
    data: { notes: 'Synthetic representative One Piece raw card.' },
  });
}
if (require.main === module) seed().finally(() => prisma.$disconnect());
