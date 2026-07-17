import 'server-only';
import { CatalogGame, ProductType, Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { parsePagination } from '@/lib/app/query-params';
import { z } from 'zod';

export const catalogFilterSchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  game: z.nativeEnum(CatalogGame).optional().catch(undefined),
  productType: z.nativeEnum(ProductType).optional().catch(undefined),
  archived: z
    .enum(['active', 'archived', 'all'])
    .catch('active')
    .default('active'),
  page: z.unknown().optional(),
  pageSize: z.unknown().optional(),
});
export type CatalogFilters = z.infer<typeof catalogFilterSchema>;
export function whereForCatalogFilters(
  filters: CatalogFilters,
): Prisma.CatalogProductWhereInput {
  const where: Prisma.CatalogProductWhereInput = {};
  if (filters.q) {
    where.OR = [
      'name',
      'setName',
      'setCode',
      'cardNumber',
      'finish',
      'variant',
    ].map((field) => ({
      [field]: { contains: filters.q, mode: 'insensitive' },
    })) as Prisma.CatalogProductWhereInput[];
  }
  if (filters.game) where.game = filters.game;
  if (filters.productType) where.productType = filters.productType;
  if (filters.archived === 'active') where.archivedAt = null;
  if (filters.archived === 'archived') where.archivedAt = { not: null };
  return where;
}
export async function listCatalogProducts(raw: Record<string, unknown>) {
  const filters = catalogFilterSchema.parse(raw);
  const pagination = parsePagination(filters);
  const where = whereForCatalogFilters(filters);
  const [items, total] = await prisma.$transaction([
    prisma.catalogProduct.findMany({
      where,
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      skip: pagination.skip,
      take: pagination.take,
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
        archivedAt: true,
      },
    }),
    prisma.catalogProduct.count({ where }),
  ]);
  return {
    items,
    total,
    filters,
    ...pagination,
    pageCount: Math.max(1, Math.ceil(total / pagination.pageSize)),
  };
}
export async function getCatalogProductDetail(productId: string) {
  return prisma.catalogProduct.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      game: true,
      productType: true,
      setName: true,
      setCode: true,
      cardNumber: true,
      rarity: true,
      language: true,
      finish: true,
      variant: true,
      manufacturer: true,
      notes: true,
      archivedAt: true,
      quantityInventoryLots: {
        select: {
          quantityOnHand: true,
          quantityReserved: true,
          status: true,
          location: { select: { name: true } },
        },
      },
      individualInventoryItems: {
        select: {
          id: true,
          status: true,
          location: { select: { name: true } },
        },
      },
    },
  });
}
