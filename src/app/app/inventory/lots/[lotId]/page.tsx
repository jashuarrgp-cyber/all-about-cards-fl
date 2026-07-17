import React from 'react';
import { notFound } from 'next/navigation';
import { requirePermission } from '@/lib/auth/authorization';
import { hasPermission } from '@/lib/auth/permissions';
import {
  availableQuantity,
  getQuantityLotDetail,
} from '@/lib/inventory/queries';
function money(v: unknown) {
  return `$${Number(v).toFixed(2)}`;
}
export default async function LotDetail({
  params,
}: {
  params: Promise<{ lotId: string }>;
}) {
  const user = await requirePermission('inventory:read');
  const canReadCost = hasPermission(user.roles ?? [], 'cost:read');
  const lot = await getQuantityLotDetail((await params).lotId, canReadCost);
  if (!lot) notFound();
  return (
    <div>
      <h1 className="text-3xl font-bold">Quantity lot</h1>
      <p className="mt-2 text-slate-300">{lot.product.name}</p>
      <section className="mt-6 rounded-2xl border border-white/10 p-4">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-slate-400">Ownership</dt>
            <dd>{lot.ownershipType}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Consignor</dt>
            <dd>{lot.consignor?.displayName ?? 'Company'}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Location</dt>
            <dd>{lot.location.name}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Status</dt>
            <dd>{lot.status}</dd>
          </div>
          <div>
            <dt className="text-slate-400">On hand / Reserved / Available</dt>
            <dd>
              {lot.quantityOnHand} / {lot.quantityReserved} /{' '}
              {availableQuantity(lot.quantityOnHand, lot.quantityReserved)}
            </dd>
          </div>
          {canReadCost && 'acquisitionUnitCost' in lot && (
            <div>
              <dt className="text-slate-400">Acquisition unit cost</dt>
              <dd>
                {money(lot.acquisitionUnitCost)} {lot.currency}
              </dd>
            </div>
          )}
          {canReadCost && 'purchaseLineId' in lot && (
            <div>
              <dt className="text-slate-400">Purchase reference</dt>
              <dd>{lot.purchaseLineId ?? '—'}</dd>
            </div>
          )}
        </dl>
      </section>
      <h2 className="mt-6 text-xl font-bold">Recent movement history</h2>
      <div className="mt-3 grid gap-2">
        {lot.movements.length ? (
          lot.movements.map((m) => (
            <div className="rounded-xl bg-white/5 p-3" key={m.id}>
              {m.movementType} · {m.quantityDelta ?? 'item'} ·{' '}
              {m.occurredAt.toISOString()}
            </div>
          ))
        ) : (
          <p className="text-slate-300">No movements recorded.</p>
        )}
      </div>
    </div>
  );
}
