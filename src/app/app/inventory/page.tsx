import React from 'react';
import Link from 'next/link';
import {
  CatalogGame,
  InventoryOwnershipType,
  InventoryStatus,
} from '@prisma/client';
import { hasPermission } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/authorization';
import { listInventory, availableQuantity } from '@/lib/inventory/queries';
import { paramsToObject, pageHref } from '@/lib/app/query-params';
import { Field, FilterPanel, inputClass } from '@/components/app/filter-panel';
import { Pagination } from '@/components/app/pagination';
function money(v: unknown) {
  return `$${Number(v).toFixed(2)}`;
}
export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePermission('inventory:read');
  const canReadCost = hasPermission(user.roles ?? [], 'cost:read');
  const raw = paramsToObject(await searchParams);
  const data = await listInventory(raw, canReadCost);
  const search = raw as Record<string, string | undefined>;
  return (
    <div>
      <h1 className="text-3xl font-bold">Inventory</h1>
      <form>
        <FilterPanel>
          <Field label="Keyword">
            <input
              className={inputClass}
              name="q"
              defaultValue={data.filters.q}
            />
          </Field>
          <Field label="Game">
            <select
              className={inputClass}
              name="game"
              defaultValue={data.filters.game ?? ''}
            >
              <option value="">All</option>
              {Object.values(CatalogGame).map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Location">
            <select
              className={inputClass}
              name="locationId"
              defaultValue={data.filters.locationId ?? ''}
            >
              <option value="">All</option>
              {data.locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ownership">
            <select
              className={inputClass}
              name="ownershipType"
              defaultValue={data.filters.ownershipType ?? ''}
            >
              <option value="">All</option>
              {Object.values(InventoryOwnershipType).map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              className={inputClass}
              name="status"
              defaultValue={data.filters.status ?? ''}
            >
              <option value="">All</option>
              {Object.values(InventoryStatus).map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Type">
            <select
              className={inputClass}
              name="type"
              defaultValue={data.filters.type}
            >
              <option value="all">All</option>
              <option value="quantity">Quantity lots</option>
              <option value="individual">Individual items</option>
            </select>
          </Field>
        </FilterPanel>
      </form>
      {data.total === 0 ? (
        <p className="rounded-2xl border border-white/10 p-6 text-slate-300">
          No inventory records match these filters.
        </p>
      ) : (
        <div className="grid gap-4">
          <h2 className="text-xl font-bold">Quantity lots</h2>
          {data.lots.map((l) => (
            <Link
              href={`/app/inventory/lots/${l.id}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 no-underline"
              key={l.id}
            >
              <h3 className="font-bold text-slate-100">{l.product.name}</h3>
              <p className="text-sm text-slate-300">
                {l.product.game} · {l.product.setCode ?? l.product.setName} ·{' '}
                {l.product.cardNumber}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <b>
                  {l.quantityOnHand}
                  <span className="block text-xs font-normal text-slate-400">
                    On hand
                  </span>
                </b>
                <b>
                  {l.quantityReserved}
                  <span className="block text-xs font-normal text-slate-400">
                    Reserved
                  </span>
                </b>
                <b>
                  {availableQuantity(l.quantityOnHand, l.quantityReserved)}
                  <span className="block text-xs font-normal text-slate-400">
                    Available
                  </span>
                </b>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                {l.ownershipType} · {l.consignor?.displayName ?? 'Company'} ·{' '}
                {l.location.name} · {l.status}
              </p>
              {canReadCost && 'acquisitionUnitCost' in l && (
                <p className="mt-2 text-sm text-amber-200">
                  Unit cost {money(l.acquisitionUnitCost)}
                </p>
              )}
            </Link>
          ))}
          <h2 className="text-xl font-bold">Individual items</h2>
          {data.items.map((i) => (
            <Link
              href={`/app/inventory/items/${i.id}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 no-underline"
              key={i.id}
            >
              <h3 className="font-bold text-slate-100">
                {i.internalInventoryId ?? i.id}
              </h3>
              <p className="text-sm text-slate-300">
                {i.product.name} · {i.ownershipType} ·{' '}
                {i.consignor?.displayName ?? 'Company'} · {i.location.name}
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {i.gradingCompany ?? 'Raw'} {i.grade ?? ''} · Cert{' '}
                {i.certificationNumber ?? '—'} · {i.status}
              </p>
              {canReadCost && 'acquisitionCost' in i && (
                <p className="mt-2 text-sm text-amber-200">
                  Cost {money(i.acquisitionCost)}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
      <Pagination
        page={data.page}
        pageCount={data.pageCount}
        previousHref={pageHref(
          '/app/inventory',
          search,
          Math.max(1, data.page - 1),
        )}
        nextHref={pageHref(
          '/app/inventory',
          search,
          Math.min(data.pageCount, data.page + 1),
        )}
      />
    </div>
  );
}
