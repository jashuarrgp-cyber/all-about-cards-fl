import 'server-only';
import type { CollectionItem, CollectionSnapshot } from './types';
import { GAME_COLORS, sampleCollection } from './sample';

// Builds the collection snapshot from live inventory when the database is
// reachable, falling back to labeled sample data otherwise (same pattern as
// src/lib/portfolio/queries.ts). Results are bounded so the screen stays
// fast even with a large inventory.

const ON_HAND_STATUSES = ['ACTIVE', 'RESERVED'] as const;
const MAX_ROWS = 200;

const GAME_LABELS: Record<string, string> = {
  POKEMON: 'Pokémon',
  ONE_PIECE: 'One Piece',
  OTHER: 'Other',
};

function gameLabel(game: string): string {
  return GAME_LABELS[game] ?? 'Other';
}

function accentFor(game: string): string {
  return GAME_COLORS[gameLabel(game)] ?? GAME_COLORS.Other;
}

function kindFor(productType: string): CollectionItem['kind'] {
  if (productType === 'SEALED_PRODUCT') return 'SEALED';
  if (productType === 'GRADED_CARD') return 'GRADED';
  return 'RAW';
}

async function getLiveItems(): Promise<CollectionItem[] | null> {
  try {
    const { prisma } = await import('@/lib/db/prisma');

    const [lots, individuals] = await Promise.all([
      prisma.quantityInventoryLot.findMany({
        where: {
          status: { in: [...ON_HAND_STATUSES] },
          quantityOnHand: { gt: 0 },
        },
        select: {
          id: true,
          quantityOnHand: true,
          product: {
            select: {
              name: true,
              setName: true,
              cardNumber: true,
              game: true,
              productType: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: MAX_ROWS,
      }),
      prisma.individualInventoryItem.findMany({
        where: { status: { in: [...ON_HAND_STATUSES] } },
        select: {
          id: true,
          gradingCompany: true,
          grade: true,
          product: {
            select: {
              name: true,
              setName: true,
              cardNumber: true,
              game: true,
              productType: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: MAX_ROWS,
      }),
    ]);

    const fromLots: CollectionItem[] = lots.map((lot) => ({
      id: `lot-${lot.id}`,
      name: lot.product.name,
      setName: lot.product.setName,
      cardNumber: lot.product.cardNumber,
      game: gameLabel(lot.product.game),
      kind: kindFor(lot.product.productType),
      quantity: lot.quantityOnHand,
      gradeLabel: null,
      accentColor: accentFor(lot.product.game),
    }));

    const fromIndividuals: CollectionItem[] = individuals.map((item) => ({
      id: `item-${item.id}`,
      name: item.product.name,
      setName: item.product.setName,
      cardNumber: item.product.cardNumber,
      game: gameLabel(item.product.game),
      kind: kindFor(item.product.productType),
      quantity: 1,
      gradeLabel:
        item.gradingCompany && item.grade
          ? `${item.gradingCompany} ${item.grade}`
          : null,
      accentColor: accentFor(item.product.game),
    }));

    return [...fromIndividuals, ...fromLots];
  } catch {
    // Database not reachable / not migrated in this environment.
    return null;
  }
}

export async function getCollectionSnapshot(): Promise<CollectionSnapshot> {
  const liveItems = await getLiveItems();

  if (liveItems === null || liveItems.length === 0) {
    return sampleCollection;
  }

  return { items: liveItems, isLive: true };
}
