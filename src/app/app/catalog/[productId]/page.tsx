import React from 'react';
import { notFound } from 'next/navigation';
import { requirePermission } from '@/lib/auth/authorization';
import { getCatalogProductDetail } from '@/lib/catalog/queries';
import { availableQuantity } from '@/lib/inventory/queries';
export default async function CatalogDetail({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  await requirePermission('catalog:read');
  const { productId } = await params;
  const product = await getCatalogProductDetail(productId);
  if (!product) notFound();
  const onHand =
    product.quantityInventoryLots.reduce((s, l) => s + l.quantityOnHand, 0) +
    product.individualInventoryItems.length;
  const reserved = product.quantityInventoryLots.reduce(
    (s, l) => s + l.quantityReserved,
    0,
  );
  const locations = new Set([
    ...product.quantityInventoryLots.map((l) => l.location.name),
    ...product.individualInventoryItems.map((i) => i.location.name),
  ]);
  return (
    <div>
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <p className="mt-2 text-slate-300">
        {product.game} · {product.productType} ·{' '}
        {[
          product.setName ?? product.setCode,
          product.cardNumber,
          product.language,
          product.finish ?? product.variant,
        ]
          .filter(Boolean)
          .join(' · ')}
      </p>
      <section className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          ['On hand', onHand],
          ['Reserved', reserved],
          ['Available', availableQuantity(onHand, reserved)],
          ['Tracked items', product.individualInventoryItems.length],
        ].map(([l, v]) => (
          <div className="rounded-2xl bg-white/5 p-4" key={l}>
            <div className="text-sm text-slate-400">{l}</div>
            <div className="text-2xl font-bold">{v}</div>
          </div>
        ))}
      </section>
      <div className="mt-6 rounded-2xl border border-white/10 p-4">
        <h2 className="font-bold">Metadata</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {Object.entries({
            Rarity: product.rarity,
            Manufacturer: product.manufacturer,
            Notes: product.notes,
            Status: product.archivedAt ? 'Archived' : 'Active',
            Locations: [...locations].join(', ') || 'None',
          }).map(([k, v]) => (
            <div key={k}>
              <dt className="text-slate-400">{k}</dt>
              <dd>{v || '—'}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
