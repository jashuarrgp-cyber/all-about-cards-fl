import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { parsePagination } from '@/lib/inventory/pagination';
export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission('locations:read');
  const { take, skip } = parsePagination(await searchParams);
  const rows = await prisma.storageLocation.findMany({
    take,
    skip,
    orderBy: { code: 'asc' },
    select: {
      id: true,
      code: true,
      name: true,
      archivedAt: true,
      parentLocation: { select: { code: true } },
    },
  });
  return (
    <section>
      <h1 className="text-3xl font-bold">Locations</h1>
      <Link href="/app/locations/new">New location</Link>
      <ul>
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={`/app/locations/${r.id}`}>{r.code}</Link> {r.name}{' '}
            {r.parentLocation?.code} {r.archivedAt ? '(archived)' : ''}
          </li>
        ))}
      </ul>
    </section>
  );
}
