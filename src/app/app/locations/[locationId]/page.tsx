import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { requirePermission } from '@/lib/auth/authorization';
export default async function Page({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  await requirePermission('locations:read');
  const { locationId } = await params;
  const l = await prisma.storageLocation.findUnique({
    where: { id: locationId },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      archivedAt: true,
      parentLocation: { select: { code: true, name: true } },
    },
  });
  if (!l) notFound();
  return (
    <section>
      <h1 className="text-3xl font-bold">{l.code}</h1>
      <p>
        {l.name} {l.parentLocation?.code}
      </p>
      <Link href={`/app/locations/${l.id}/edit`}>Edit</Link>
    </section>
  );
}
