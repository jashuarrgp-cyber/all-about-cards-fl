import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { requirePermission } from '@/lib/auth/authorization';
export default async function Page({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  await requirePermission('catalog:read');
  const { productId } = await params;
  const p = await prisma.catalogProduct.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      game: true,
      productType: true,
      setName: true,
      setCode: true,
      cardNumber: true,
      rarity: true,
      archivedAt: true,
    },
  });
  if (!p) notFound();
  return (
    <section>
      <h1 className="text-3xl font-bold">{p.name}</h1>
      <p>
        {p.game} {p.productType} {p.setName} {p.cardNumber} {p.rarity}
      </p>
      <Link href={`/app/catalog/${p.id}/edit`}>Edit</Link>
    </section>
  );
}
