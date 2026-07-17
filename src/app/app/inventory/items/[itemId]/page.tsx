import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { hasPermission } from '@/lib/auth/permissions';
export default async function Page({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const u = await requirePermission('inventory:read');
  const canCost = hasPermission(u.roles, 'cost:read');
  const { itemId } = await params;
  const i = await prisma.individualInventoryItem.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      internalInventoryId: true,
      status: true,
      ownershipType: true,
      gradingCompany: true,
      grade: true,
      certificationNumber: true,
      ...(canCost ? { acquisitionCost: true } : {}),
      product: { select: { name: true } },
      location: { select: { code: true, name: true } },
      consignor: { select: { displayName: true } },
    },
  });
  if (!i) notFound();
  return (
    <section>
      <h1 className="text-3xl font-bold">Individual item</h1>
      <p>
        {i.product.name} {i.gradingCompany} {i.grade} {i.certificationNumber} at{' '}
        {i.location.code}
      </p>
    </section>
  );
}
