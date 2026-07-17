import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { requirePermission } from '@/lib/auth/authorization';
export default async function Page({
  params,
}: {
  params: Promise<{ purchaseId: string }>;
}) {
  await requirePermission('purchases:read');
  const { purchaseId } = await params;
  const p = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    select: {
      id: true,
      purchaseDate: true,
      sourceName: true,
      totalCost: true,
      currency: true,
      lines: {
        select: {
          id: true,
          quantity: true,
          inventoryType: true,
          product: { select: { name: true } },
        },
      },
    },
  });
  if (!p) notFound();
  return (
    <section>
      <h1 className="text-3xl font-bold">Purchase {p.sourceName}</h1>
      <p>
        {p.currency} {p.totalCost.toString()}
      </p>
      <ul>
        {p.lines.map((l) => (
          <li key={l.id}>
            {l.product.name} x {l.quantity} {l.inventoryType}
          </li>
        ))}
      </ul>
    </section>
  );
}
