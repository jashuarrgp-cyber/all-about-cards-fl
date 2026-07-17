import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { parsePagination } from '@/lib/inventory/pagination';
export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission('purchases:read');
  const { take, skip } = parsePagination(await searchParams);
  const rows = await prisma.purchase.findMany({
    take,
    skip,
    orderBy: { purchaseDate: 'desc' },
    select: {
      id: true,
      purchaseDate: true,
      sourceName: true,
      currency: true,
      totalCost: true,
    },
  });
  return (
    <section>
      <h1 className="text-3xl font-bold">Purchases</h1>
      <Link href="/app/purchases/new">New purchase</Link>
      <ul>
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={`/app/purchases/${r.id}`}>{r.sourceName}</Link>{' '}
            {r.purchaseDate.toDateString()} {r.currency}{' '}
            {r.totalCost.toString()}
          </li>
        ))}
      </ul>
    </section>
  );
}
