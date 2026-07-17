import React from 'react';
import { notFound } from 'next/navigation';
import { requirePermission } from '@/lib/auth/authorization';
import { hasPermission } from '@/lib/auth/permissions';
import { getIndividualItemDetail } from '@/lib/inventory/queries';
function money(v: unknown) {
  return `$${Number(v).toFixed(2)}`;
}
export default async function ItemDetail({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const user = await requirePermission('inventory:read');
  const canReadCost = hasPermission(user.roles ?? [], 'cost:read');
  const item = await getIndividualItemDetail(
    (await params).itemId,
    canReadCost,
  );
  if (!item) notFound();
  return (
    <div>
      <h1 className="text-3xl font-bold">
        {item.internalInventoryId ?? item.id}
      </h1>
      <p className="mt-2 text-slate-300">{item.product.name}</p>
      <section className="mt-6 rounded-2xl border border-white/10 p-4">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-slate-400">Ownership</dt>
            <dd>{item.ownershipType}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Consignor</dt>
            <dd>{item.consignor?.displayName ?? 'Company'}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Location</dt>
            <dd>{item.location.name}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Status</dt>
            <dd>{item.status}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Grade</dt>
            <dd>
              {item.gradingCompany ?? '—'} {item.grade ?? ''}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Certification</dt>
            <dd>{item.certificationNumber ?? '—'}</dd>
          </div>
          {canReadCost && 'acquisitionCost' in item && (
            <div>
              <dt className="text-slate-400">Acquisition cost</dt>
              <dd>
                {money(item.acquisitionCost)} {item.currency}
              </dd>
            </div>
          )}
          {canReadCost && 'purchaseLineId' in item && (
            <div>
              <dt className="text-slate-400">Purchase reference</dt>
              <dd>{item.purchaseLineId ?? '—'}</dd>
            </div>
          )}
        </dl>
      </section>
      <h2 className="mt-6 text-xl font-bold">Recent movement history</h2>
      <div className="mt-3 grid gap-2">
        {item.movements.length ? (
          item.movements.map((m) => (
            <div className="rounded-xl bg-white/5 p-3" key={m.id}>
              {m.movementType} · {m.occurredAt.toISOString()}
            </div>
          ))
        ) : (
          <p className="text-slate-300">No movements recorded.</p>
        )}
      </div>
    </div>
  );
}
