import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { hasPermission } from '@/lib/auth/permissions';
import { parsePagination } from '@/lib/inventory/pagination';
export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requirePermission('inventory:read');
  const canCost = hasPermission(user.roles, 'cost:read');
  const sp = await searchParams;
  const { take, skip } = parsePagination(sp);
  const lots = await prisma.quantityInventoryLot.findMany({
    take,
    skip,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      quantityOnHand: true,
      quantityReserved: true,
      ownershipType: true,
      status: true,
      ...(canCost ? { acquisitionUnitCost: true } : {}),
      product: { select: { name: true, game: true, productType: true } },
      location: { select: { code: true, name: true } },
      consignor: { select: { displayName: true } },
    },
  });
  const items = await prisma.individualInventoryItem.findMany({
    take,
    skip,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      internalInventoryId: true,
      gradingCompany: true,
      grade: true,
      certificationNumber: true,
      ownershipType: true,
      status: true,
      ...(canCost ? { acquisitionCost: true } : {}),
      product: { select: { name: true, game: true, productType: true } },
      location: { select: { code: true, name: true } },
      consignor: { select: { displayName: true } },
    },
  });
  return (
    <section>
      <h1 className="text-3xl font-bold">Inventory</h1>
      <h2>Quantity lots</h2>
      <ul>
        {lots.map((l) => (
          <li key={l.id}>
            <Link href={`/app/inventory/lots/${l.id}`}>{l.product.name}</Link>{' '}
            {l.quantityOnHand - l.quantityReserved} available at{' '}
            {l.location.code} {l.consignor?.displayName}
          </li>
        ))}
      </ul>
      <h2>Individual items</h2>
      <ul>
        {items.map((i) => (
          <li key={i.id}>
            <Link href={`/app/inventory/items/${i.id}`}>{i.product.name}</Link>{' '}
            {i.gradingCompany} {i.grade} {i.certificationNumber} at{' '}
            {i.location.code}
          </li>
        ))}
      </ul>
    </section>
  );
}
