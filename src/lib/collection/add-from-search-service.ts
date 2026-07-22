import 'server-only';
import { z } from 'zod';
import type { Prisma, PrismaClient } from '@prisma/client';
import { receiveQuantityInventory } from '@/lib/inventory/service';

// Plain, testable logic for adding a live-search card into real inventory.
// No auth check here — that's the caller's job (the 'use server' action in
// add-from-search.ts), the same separation already used by
// src/lib/inventory/service.ts. Reuses receiveQuantityInventory() so this
// goes through the same audited lot + movement history path as every other
// inventory receipt.
//
// Acquisition cost is left to the caller, never defaulted to the live
// market price — market price is what a card could sell for, not what was
// paid for it, and treating those as the same thing would misrepresent
// real cost history.

const inputSchema = z.object({
  externalId: z.string().min(1),
  name: z.string().min(1),
  setName: z.string().min(1),
  cardNumber: z.string().nullable().optional(),
  rarity: z.string().nullable().optional(),
  quantity: z.number().int().positive().max(9999),
  // Blank means "not entered yet" — stored as 0, never guessed from price.
  acquisitionUnitCost: z
    .string()
    .regex(/^\d*(\.\d{1,4})?$/)
    .optional()
    .default(''),
});

export type AddFromSearchInput = z.input<typeof inputSchema>;

type Db = PrismaClient | Prisma.TransactionClient;

async function findOrCreateProduct(
  tx: Prisma.TransactionClient,
  data: z.infer<typeof inputSchema>,
) {
  // externalReferences is a loosely-typed JSON column; a query-shape issue
  // here should fall through to creating a fresh product rather than
  // failing the whole add.
  try {
    const existing = await tx.catalogProduct.findFirst({
      where: {
        externalReferences: {
          path: ['pokemonTcgId'],
          equals: data.externalId,
        },
      },
    });
    if (existing) return existing;
  } catch {
    // fall through to create
  }

  return tx.catalogProduct.create({
    data: {
      game: 'POKEMON',
      productType: 'RAW_CARD',
      name: data.name,
      setName: data.setName,
      cardNumber: data.cardNumber ?? undefined,
      rarity: data.rarity ?? undefined,
      externalReferences: { pokemonTcgId: data.externalId },
    },
  });
}

async function findOrCreateDefaultLocation(tx: Prisma.TransactionClient) {
  const existing = await tx.storageLocation.findFirst({
    where: { archivedAt: null },
    orderBy: { createdAt: 'asc' },
  });
  if (existing) return existing;

  return tx.storageLocation.create({
    data: { code: 'GENERAL', name: 'General' },
  });
}

export async function addCardFromSearch(
  db: Db,
  rawInput: AddFromSearchInput,
  actingUserId: string,
) {
  const data = inputSchema.parse(rawInput);

  const run = async (tx: Prisma.TransactionClient) => {
    const product = await findOrCreateProduct(tx, data);
    const location = await findOrCreateDefaultLocation(tx);

    const lot = await receiveQuantityInventory(
      tx,
      {
        productId: product.id,
        locationId: location.id,
        ownershipType: 'COMPANY',
        quantity: data.quantity,
        acquisitionUnitCost: data.acquisitionUnitCost || '0',
        currency: 'USD',
      },
      undefined,
      actingUserId,
    );

    await tx.auditLog.create({
      data: {
        action: 'inventory.search.add',
        entityType: 'QuantityInventoryLot',
        entityId: lot.id,
        actingUserId,
        afterState: {
          productId: product.id,
          quantity: data.quantity,
          source: 'live-search',
          externalId: data.externalId,
        },
      },
    });

    return { productId: product.id, lotId: lot.id };
  };

  // Already inside a transaction (Prisma.TransactionClient has no
  // $transaction of its own) — just run directly.
  if ('$transaction' in db) return db.$transaction(run);
  return run(db);
}
