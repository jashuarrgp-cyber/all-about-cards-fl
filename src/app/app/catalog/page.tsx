import React from 'react';
import Link from 'next/link';
import { CatalogGame, ProductType } from '@prisma/client';
import { FilterPanel, Field, inputClass } from '@/components/app/filter-panel';
import { Pagination } from '@/components/app/pagination';
import { pageHref, paramsToObject } from '@/lib/app/query-params';
import { requirePermission } from '@/lib/auth/authorization';
import { listCatalogProducts } from '@/lib/catalog/queries';
export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission('catalog:read');
  const raw = paramsToObject(await searchParams);
  const data = await listCatalogProducts(raw);
  const search = raw as Record<string, string | undefined>;
  return (
    <div>
      <h1 className="text-3xl font-bold">Catalog</h1>
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
          <Field label="Type">
            <select
              className={inputClass}
              name="productType"
              defaultValue={data.filters.productType ?? ''}
            >
              <option value="">All</option>
              {Object.values(ProductType).map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Archived">
            <select
              className={inputClass}
              name="archived"
              defaultValue={data.filters.archived}
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="all">All</option>
            </select>
          </Field>
        </FilterPanel>
      </form>
      {data.total === 0 ? (
        <p className="rounded-2xl border border-white/10 p-6 text-slate-300">
          No catalog products match these filters.
        </p>
      ) : (
        <div className="grid gap-3">
          {data.items.map((p) => (
            <Link
              key={p.id}
              href={`/app/catalog/${p.id}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 no-underline hover:bg-white/10"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-100">{p.name}</h2>
                {p.archivedAt && (
                  <span className="rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-200">
                    Archived
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-slate-300">
                {p.game} · {p.productType} ·{' '}
                {[
                  p.setName ?? p.setCode,
                  p.cardNumber,
                  p.language,
                  p.finish ?? p.variant,
                ]
                  .filter(Boolean)
                  .join(' · ') || 'No extra metadata'}
              </p>
            </Link>
          ))}
        </div>
      )}
      <Pagination
        page={data.page}
        pageCount={data.pageCount}
        previousHref={pageHref(
          '/app/catalog',
          search,
          Math.max(1, data.page - 1),
        )}
        nextHref={pageHref(
          '/app/catalog',
          search,
          Math.min(data.pageCount, data.page + 1),
        )}
      />
    </div>
  );
}
