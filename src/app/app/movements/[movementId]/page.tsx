import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { requirePermission } from '@/lib/auth/authorization';
export default async function Page({
  params,
}: {
  params: Promise<{ movementId: string }>;
}) {
  await requirePermission('movements:read');
  const { movementId } = await params;
  const m = await prisma.inventoryMovement.findUnique({
    where: { id: movementId },
    select: {
      id: true,
      movementType: true,
      quantityDelta: true,
      occurredAt: true,
      notes: true,
      fromLocation: { select: { code: true } },
      toLocation: { select: { code: true } },
    },
  });
  if (!m) notFound();
  return (
    <section>
      <h1 className="text-3xl font-bold">Movement {m.movementType}</h1>
      <p>
        {m.quantityDelta} from {m.fromLocation?.code} to {m.toLocation?.code}
      </p>
    </section>
  );
}
