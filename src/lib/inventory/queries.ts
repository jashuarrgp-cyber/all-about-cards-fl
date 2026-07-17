import 'server-only';
import {
  InventoryOwnershipType,
  InventoryStatus,
  Prisma,
  CatalogGame,
} from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { parsePagination } from '@/lib/app/query-params';
import { z } from 'zod';

export const inventoryFilterSchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  game: z.nativeEnum(CatalogGame).optional().catch(undefined),
  locationId: z.string().uuid().optional().catch(undefined),
  ownershipType: z
    .nativeEnum(InventoryOwnershipType)
    .optional()
    .catch(undefined),
  status: z.nativeEnum(InventoryStatus).optional().catch(undefined),
  type: z.enum(['all', 'quantity', 'individual']).optional().catch('all'),
  page: z.unknown().optional(),
  pageSize: z.unknown().optional(),
});
export function availableQuantity(onHand: number, reserved: number) {
  return Math.max(0, onHand - reserved);
}
export function quantityLotSelect(canReadCost: boolean) {
  return {
    id: true,
    ownershipType: true,
    quantityOnHand: true,
    quantityReserved: true,
    status: true,
    ...(canReadCost
      ? { currency: true, acquisitionUnitCost: true, purchaseLineId: true }
      : {}),
    product: {
      select: {
        id: true,
        name: true,
        game: true,
        productType: true,
        setName: true,
        setCode: true,
        cardNumber: true,
        language: true,
        finish: true,
        variant: true,
      },
    },
    consignor: { select: { displayName: true } },
    location: { select: { id: true, code: true, name: true } },
  } satisfies Prisma.QuantityInventoryLotSelect;
}
export function individualItemSelect(canReadCost: boolean) {
  return {
    id: true,
    internalInventoryId: true,
    ownershipType: true,
    status: true,
    gradingCompany: true,
    grade: true,
    certificationNumber: true,
    ...(canReadCost
      ? { currency: true, acquisitionCost: true, purchaseLineId: true }
      : {}),
    product: {
      select: {
        id: true,
        name: true,
        game: true,
        productType: true,
        setName: true,
        setCode: true,
        cardNumber: true,
        language: true,
        finish: true,
        variant: true,
      },
    },
    consignor: { select: { displayName: true } },
    location: { select: { id: true, code: true, name: true } },
  } satisfies Prisma.IndividualInventoryItemSelect;
}
function productSearch(q: string) {
  return {
    OR: ['name', 'setName', 'setCode', 'cardNumber'].map((field) => ({
      [field]: { contains: q, mode: 'insensitive' },
    })),
  } as Prisma.CatalogProductWhereInput;
}
function lotWhere(
  filters: z.infer<typeof inventoryFilterSchema>,
): Prisma.QuantityInventoryLotWhereInput {
  return {
    ...(filters.game && { product: { game: filters.game } }),
    ...(filters.locationId && { locationId: filters.locationId }),
    ...(filters.ownershipType && { ownershipType: filters.ownershipType }),
    ...(filters.status && { status: filters.status }),
    ...(filters.q && {
      OR: [
        { product: productSearch(filters.q) },
        {
          consignor: {
            displayName: { contains: filters.q, mode: 'insensitive' },
          },
        },
        { location: { name: { contains: filters.q, mode: 'insensitive' } } },
      ],
    }),
  };
}
function itemWhere(
  filters: z.infer<typeof inventoryFilterSchema>,
): Prisma.IndividualInventoryItemWhereInput {
  return {
    ...(filters.game && { product: { game: filters.game } }),
    ...(filters.locationId && { locationId: filters.locationId }),
    ...(filters.ownershipType && { ownershipType: filters.ownershipType }),
    ...(filters.status && { status: filters.status }),
    ...(filters.q && {
      OR: [
        { product: productSearch(filters.q) },
        { internalInventoryId: { contains: filters.q, mode: 'insensitive' } },
        { certificationNumber: { contains: filters.q, mode: 'insensitive' } },
        {
          consignor: {
            displayName: { contains: filters.q, mode: 'insensitive' },
          },
        },
      ],
    }),
  };
}
export async function listInventory(
  raw: Record<string, unknown>,
  canReadCost: boolean,
) {
  const filters = inventoryFilterSchema.parse(raw);
  const pagination = parsePagination(filters);
  const includeLots = filters.type !== 'individual';
  const includeItems = filters.type !== 'quantity';
  const [lots, lotTotal, items, itemTotal, locations] =
    await prisma.$transaction([
      prisma.quantityInventoryLot.findMany({
        where: includeLots ? lotWhere(filters) : { id: '__none__' },
        orderBy: { createdAt: 'desc' },
        skip: includeLots ? pagination.skip : 0,
        take: includeLots ? pagination.take : 0,
        select: quantityLotSelect(canReadCost),
      }),
      includeLots
        ? prisma.quantityInventoryLot.count({ where: lotWhere(filters) })
        : prisma.quantityInventoryLot.count({ where: { id: '__none__' } }),
      prisma.individualInventoryItem.findMany({
        where: includeItems ? itemWhere(filters) : { id: '__none__' },
        orderBy: { createdAt: 'desc' },
        skip: includeItems ? pagination.skip : 0,
        take: includeItems ? pagination.take : 0,
        select: individualItemSelect(canReadCost),
      }),
      includeItems
        ? prisma.individualInventoryItem.count({ where: itemWhere(filters) })
        : prisma.individualInventoryItem.count({ where: { id: '__none__' } }),
      prisma.storageLocation.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, code: true },
      }),
    ]);
  const total = lotTotal + itemTotal;
  return {
    lots,
    lotTotal,
    items,
    itemTotal,
    total,
    locations,
    filters,
    ...pagination,
    pageCount: Math.max(
      1,
      Math.ceil(Math.max(lotTotal, itemTotal) / pagination.pageSize),
    ),
  };
}
export async function getQuantityLotDetail(id: string, canReadCost: boolean) {
  return prisma.quantityInventoryLot.findUnique({
    where: { id },
    select: {
      ...quantityLotSelect(canReadCost),
      movements: {
        orderBy: { occurredAt: 'desc' },
        take: 10,
        select: {
          id: true,
          movementType: true,
          quantityDelta: true,
          occurredAt: true,
          notes: true,
          fromLocation: { select: { name: true } },
          toLocation: { select: { name: true } },
        },
      },
    },
  });
}
export async function getIndividualItemDetail(
  id: string,
  canReadCost: boolean,
) {
  return prisma.individualInventoryItem.findUnique({
    where: { id },
    select: {
      ...individualItemSelect(canReadCost),
      notes: true,
      gradingQualifier: true,
      gradingLabelDetails: true,
      movements: {
        orderBy: { occurredAt: 'desc' },
        take: 10,
        select: {
          id: true,
          movementType: true,
          quantityDelta: true,
          occurredAt: true,
          notes: true,
          fromLocation: { select: { name: true } },
          toLocation: { select: { name: true } },
        },
      },
    },
  });
}
export async function getDashboardCounts() {
  const [catalogCount, quantityLotCount, individualItemCount, quantityRows] =
    await prisma.$transaction([
      prisma.catalogProduct.count(),
      prisma.quantityInventoryLot.count(),
      prisma.individualInventoryItem.count(),
      prisma.quantityInventoryLot.findMany({
        select: { quantityOnHand: true, quantityReserved: true },
      }),
    ]);
  return {
    catalogCount,
    quantityLotCount,
    individualItemCount,
    totalAvailableUnits:
      quantityRows.reduce(
        (sum, row) =>
          sum + availableQuantity(row.quantityOnHand, row.quantityReserved),
        0,
      ) + individualItemCount,
    reservedUnits: quantityRows.reduce(
      (sum, row) => sum + row.quantityReserved,
      0,
    ),
  };
}
