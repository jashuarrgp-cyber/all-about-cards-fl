import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { hasPermission } from '@/lib/auth/permissions';
export default async function Page({
  params,
}: {
  params: Promise<{ lotId: string }>;
}) {
  const u = await requirePermission('inventory:read');
  const canCost = hasPermission(u.roles, 'cost:read');
  const { lotId } = await params;
  const l = await prisma.quantityInventoryLot.findUnique({
    where: { id: lotId },
    select: {
      id: true,
      quantityOnHand: true,
      quantityReserved: true,
      status: true,
      ownershipType: true,
      ...(canCost ? { acquisitionUnitCost: true } : {}),
      product: { select: { name: true } },
      location: { select: { code: true, name: true } },
      consignor: { select: { displayName: true } },
    },
  });
  if (!l) notFound();
  return (
    <section>
      <h1 className="text-3xl font-bold">Quantity lot</h1>
      <p>
        {l.product.name} at {l.location.code}; available{' '}
        {l.quantityOnHand - l.quantityReserved}; {l.consignor?.displayName}
      </p>
    </section>
  );
}
