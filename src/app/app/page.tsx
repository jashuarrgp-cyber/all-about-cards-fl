import React from 'react';
import Link from 'next/link';
import { getDashboardCounts } from '@/lib/inventory/queries';
import { requirePermission } from '@/lib/auth/authorization';
export default async function AppPage() {
  await requirePermission('inventory:read');
  const counts = await getDashboardCounts();
  const cards = [
    ['Catalog products', counts.catalogCount],
    ['Quantity lots', counts.quantityLotCount],
    ['Individual items', counts.individualItemCount],
    ['Available units', counts.totalAvailableUnits],
    ['Reserved units', counts.reservedUnits],
  ];
  return (
    <div>
      <h1 className="text-3xl font-bold">Internal dashboard</h1>
      <p className="mt-2 text-slate-300">
        Read-only catalog and inventory visibility for authorized staff.
      </p>
      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className="text-sm text-slate-400">{label}</div>
            <div className="mt-2 text-3xl font-bold">{value}</div>
          </div>
        ))}
      </section>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          className="rounded-2xl bg-amber-300 p-5 font-bold text-slate-950 no-underline"
          href="/app/catalog"
        >
          Open Catalog
        </Link>
        <Link
          className="rounded-2xl bg-white/10 p-5 font-bold text-slate-100 no-underline"
          href="/app/inventory"
        >
          Open Inventory
        </Link>
      </div>
    </div>
  );
}
