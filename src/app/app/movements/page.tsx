import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { parsePagination } from '@/lib/inventory/pagination';
export default async function MovementsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission('movements:read');
  const { take, skip } = parsePagination(await searchParams);
  const rows = await prisma.inventoryMovement.findMany({
    take,
    skip,
    orderBy: { occurredAt: 'desc' },
    select: {
      id: true,
      movementType: true,
      quantityDelta: true,
      occurredAt: true,
    },
  });
  return (
    <section>
      <h1 className="text-3xl font-bold">Movement history</h1>
      <ul>
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={`/app/movements/${r.id}`}>{r.movementType}</Link>{' '}
            {r.quantityDelta} {r.occurredAt.toISOString()}
          </li>
        ))}
      </ul>
    </section>
  );
}
