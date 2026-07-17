import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { parsePagination } from '@/lib/inventory/pagination';
export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission('catalog:read');
  const sp = await searchParams;
  const { take, skip } = parsePagination(sp);
  const where = {
    archivedAt:
      sp.archived === 'true'
        ? { not: null }
        : sp.archived === 'false'
          ? null
          : undefined,
    game: sp.game as never,
    productType: sp.productType as never,
    name: sp.q ? { contains: sp.q, mode: 'insensitive' as const } : undefined,
  };
  const products = await prisma.catalogProduct.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take,
    skip,
    select: {
      id: true,
      name: true,
      game: true,
      productType: true,
      setName: true,
      cardNumber: true,
      rarity: true,
      archivedAt: true,
    },
  });
  return (
    <section>
      <h1 className="text-3xl font-bold">Product catalog</h1>
      <Link href="/app/catalog/new">New product</Link>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            <Link href={`/app/catalog/${p.id}`}>{p.name}</Link> — {p.game}{' '}
            {p.productType} {p.archivedAt ? '(archived)' : ''}
          </li>
        ))}
      </ul>
    </section>
  );
}
