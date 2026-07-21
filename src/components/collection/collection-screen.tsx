'use client';

import { useMemo, useState } from 'react';
import type {
  CollectionItem,
  CollectionKind,
  CollectionSnapshot,
} from '@/lib/collection/types';
import { formatCount } from '@/lib/format';
import { SearchIcon } from '@/components/app/icons';

type Filter = 'ALL' | CollectionKind;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'RAW', label: 'Raw' },
  { key: 'GRADED', label: 'Graded' },
  { key: 'SEALED', label: 'Sealed' },
];

const KIND_BADGES: Record<CollectionKind, string> = {
  RAW: 'Raw',
  GRADED: 'Graded',
  SEALED: 'Sealed',
};

function CollectionCard({ item }: { item: CollectionItem }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]">
      <div
        className="relative flex aspect-[4/3] items-end p-3"
        style={{
          background: `linear-gradient(160deg, ${item.accentColor}b3, ${item.accentColor}40)`,
        }}
      >
        <span className="absolute left-2 top-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur">
          {item.game}
        </span>
        {item.gradeLabel ? (
          <span className="absolute right-2 top-2 rounded-full bg-brand-teal/90 px-2 py-0.5 text-[10px] font-bold text-base-950">
            {item.gradeLabel}
          </span>
        ) : (
          item.quantity > 1 && (
            <span className="absolute right-2 top-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur">
              ×{formatCount(item.quantity)}
            </span>
          )
        )}
        <span className="line-clamp-2 text-sm font-semibold leading-snug text-white drop-shadow">
          {item.name}
        </span>
      </div>
      <div className="space-y-0.5 px-3 py-2.5">
        <div className="truncate text-xs text-slate-400">
          {item.setName ?? '—'}
        </div>
        <div className="flex items-center justify-between">
          <span className="truncate text-[11px] text-slate-500">
            {item.cardNumber ?? KIND_BADGES[item.kind]}
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            {KIND_BADGES[item.kind]}
          </span>
        </div>
      </div>
    </div>
  );
}

export function CollectionScreen({ data }: { data: CollectionSnapshot }) {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.items.filter((item) => {
      if (filter !== 'ALL' && item.kind !== filter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.setName?.toLowerCase().includes(q) ?? false) ||
        (item.cardNumber?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [data.items, filter, query]);

  const totalCopies = data.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-5 pb-6 pt-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Collection</h1>
        <p className="mt-1 text-sm text-slate-500">
          {formatCount(totalCopies)} items ·{' '}
          {data.isLive
            ? 'live from your inventory'
            : 'sample data — connects to your live inventory automatically'}
        </p>
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.04] px-4 py-3">
        <SearchIcon className="h-5 w-5 shrink-0 text-slate-500" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your collection"
          className="w-full bg-transparent text-[15px] text-white placeholder:text-slate-500 focus:outline-none"
          aria-label="Search your collection"
        />
      </label>

      <div className="flex gap-2">
        {FILTERS.map(({ key, label }) => {
          const selected = key === filter;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={selected}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                selected
                  ? 'bg-white text-base-950'
                  : 'bg-white/[0.06] text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-3xl border border-white/5 bg-white/[0.03] py-16 text-center">
          <p className="text-sm text-slate-400">Nothing matches that search.</p>
          <p className="mt-1 text-xs text-slate-500">
            Try a different name, set, or filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {visible.map((item) => (
            <CollectionCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
