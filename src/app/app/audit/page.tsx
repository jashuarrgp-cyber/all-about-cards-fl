import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { parsePagination } from '@/lib/inventory/pagination';
export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission('audit:read');
  const { take, skip } = parsePagination(await searchParams);
  const rows = await prisma.auditLog.findMany({
    take,
    skip,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      createdAt: true,
    },
  });
  return (
    <section>
      <h1 className="text-3xl font-bold">Audit history</h1>
      <ul>
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={`/app/audit/${r.id}`}>{r.action}</Link> {r.entityType}{' '}
            {r.createdAt.toISOString()}
          </li>
        ))}
      </ul>
    </section>
  );
}
