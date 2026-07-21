import 'server-only';
import type { PortfolioSnapshot } from './types';
import { sampleSnapshot } from './sample';

// Builds the portfolio snapshot for the dashboard.
//
// Item counts (Raw / Graded / Sealed) are read from the live inventory tables
// when the database is reachable. Monetary values (total, chart history,
// breakdown, most-valuable) remain sample figures until live market pricing
// lands in a later phase — so `valuesAreSample` stays true for now.
//
// Every database interaction is guarded: if Prisma is unavailable, the schema
// is not migrated, or the tables are empty, we fall back to sample counts and
// mark `countsAreLive` false. The screen therefore always renders cleanly.

const ON_HAND_STATUSES = ['ACTIVE', 'RESERVED'] as const;

async function getLiveCounts(): Promise<PortfolioSnapshot['counts'] | null> {
  try {
    const { prisma } = await import('@/lib/db/prisma');

    const [
      rawLots,
      sealedLots,
      gradedLots,
      rawIndividual,
      sealedIndividual,
      gradedIndividual,
    ] = await Promise.all([
      prisma.quantityInventoryLot.aggregate({
        _sum: { quantityOnHand: true },
        where: {
          status: { in: [...ON_HAND_STATUSES] },
          product: { productType: 'RAW_CARD' },
        },
      }),
      prisma.quantityInventoryLot.aggregate({
        _sum: { quantityOnHand: true },
        where: {
          status: { in: [...ON_HAND_STATUSES] },
          product: { productType: 'SEALED_PRODUCT' },
        },
      }),
      prisma.quantityInventoryLot.aggregate({
        _sum: { quantityOnHand: true },
        where: {
          status: { in: [...ON_HAND_STATUSES] },
          product: { productType: 'GRADED_CARD' },
        },
      }),
      prisma.individualInventoryItem.count({
        where: {
          status: { in: [...ON_HAND_STATUSES] },
          product: { productType: 'RAW_CARD' },
        },
      }),
      prisma.individualInventoryItem.count({
        where: {
          status: { in: [...ON_HAND_STATUSES] },
          product: { productType: 'SEALED_PRODUCT' },
        },
      }),
      prisma.individualInventoryItem.count({
        where: {
          status: { in: [...ON_HAND_STATUSES] },
          product: { productType: 'GRADED_CARD' },
        },
      }),
    ]);

    return {
      raw: (rawLots._sum.quantityOnHand ?? 0) + rawIndividual,
      sealed: (sealedLots._sum.quantityOnHand ?? 0) + sealedIndividual,
      graded: (gradedLots._sum.quantityOnHand ?? 0) + gradedIndividual,
    };
  } catch {
    // Database not reachable / not migrated in this environment.
    return null;
  }
}

export async function getPortfolioSnapshot(): Promise<PortfolioSnapshot> {
  const liveCounts = await getLiveCounts();

  // Only treat counts as "live" when the database actually returned inventory.
  const hasInventory =
    liveCounts !== null &&
    liveCounts.raw + liveCounts.sealed + liveCounts.graded > 0;

  if (!hasInventory) {
    return sampleSnapshot;
  }

  return {
    ...sampleSnapshot,
    counts: liveCounts,
    countsAreLive: true,
  };
}
