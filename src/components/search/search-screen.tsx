'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type {
  CardSearchResult,
  PriceableCard,
  SetListResult,
  SetSummary,
} from '@/lib/pricing/types';
import { formatUsd2 } from '@/lib/format';
import { SearchIcon } from '@/components/app/icons';

// Live card search: type a Pokémon card name and get real market prices back
// from the pricing API route, which calls the Pokémon TCG API server-side.
// Also supports browsing by set — real set logos, release dates, and card
// counts, from the same official source. Pokémon only for now — no similarly
// clean official/free source exists yet for the other games in the catalog.
// Never shows cost or profit — only the same public market price anyone can
// see on the official service.

const DEBOUNCE_MS = 350;

function PriceRow({ card }: { card: PriceableCard }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
      {card.imageSmall ? (
        <Image
          src={card.imageSmall}
          alt={card.name}
          width={40}
          height={56}
          unoptimized
          className="h-14 w-10 shrink-0 rounded-md object-cover"
        />
      ) : (
        <span className="h-14 w-10 shrink-0 rounded-md bg-white/10" />
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-white">
          {card.name}
        </div>
        <div className="truncate text-xs text-slate-500">
          {card.setName}
          {card.number ? ` · #${card.number}` : ''}
          {card.rarity ? ` · ${card.rarity}` : ''}
        </div>
      </div>
      {card.marketPrice !== null ? (
        <div className="shrink-0 text-sm font-bold tabular-nums text-white">
          {formatUsd2(card.marketPrice)}
        </div>
      ) : (
        <div className="shrink-0 text-xs text-slate-500">Price unavailable</div>
      )}
    </li>
  );
}

function releaseYear(releaseDate: string | null): string | null {
  const year = releaseDate?.match(/^\d{4}/)?.[0];
  return year ?? null;
}

function SetTile({
  set,
  onSelect,
}: {
  set: SetSummary;
  onSelect: (set: SetSummary) => void;
}) {
  const year = releaseYear(set.releaseDate);
  return (
    <button
      type="button"
      onClick={() => onSelect(set)}
      className="flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-center"
    >
      {set.logo ? (
        <Image
          src={set.logo}
          alt=""
          width={96}
          height={40}
          unoptimized
          className="h-10 w-24 object-contain"
        />
      ) : (
        <span className="flex h-10 w-24 items-center justify-center rounded-md bg-white/10 text-xs text-slate-400">
          {set.name.slice(0, 2).toUpperCase()}
        </span>
      )}
      <span className="line-clamp-2 text-xs font-semibold text-white">
        {set.name}
      </span>
      <span className="text-[11px] text-slate-500">
        {[year, set.total ? `${set.total} cards` : null]
          .filter(Boolean)
          .join(' · ')}
      </span>
    </button>
  );
}

export function SearchScreen({
  endpoint = '/api/pricing/search',
  setsEndpoint = '/api/pricing/sets',
}: {
  endpoint?: string;
  setsEndpoint?: string;
}) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<CardSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  const [sets, setSets] = useState<SetSummary[] | null>(null);
  const [setsError, setSetsError] = useState<string | null>(null);
  const [activeSet, setActiveSet] = useState<SetSummary | null>(null);

  // Load the browse-by-set list once, up front.
  useEffect(() => {
    let cancelled = false;
    fetch(setsEndpoint, { cache: 'no-store' })
      .then((res) => res.json() as Promise<SetListResult>)
      .then((data) => {
        if (cancelled) return;
        if (data.ok && Array.isArray(data.sets)) setSets(data.sets);
        else setSetsError(data.error ?? 'Could not load sets.');
      })
      .catch(() => {
        if (!cancelled) setSetsError('Could not load sets.');
      });
    return () => {
      cancelled = true;
    };
  }, [setsEndpoint]);

  useEffect(() => {
    const q = query.trim();
    if (!q && !activeSet) {
      setResult(null);
      setLoading(false);
      return;
    }

    const id = ++requestId.current;
    setLoading(true);
    const handle = setTimeout(() => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (activeSet) params.set('setId', activeSet.id);

      fetch(`${endpoint}?${params.toString()}`, { cache: 'no-store' })
        .then((res) => res.json() as Promise<CardSearchResult>)
        .then((data) => {
          if (id === requestId.current) setResult(data);
        })
        .catch(() => {
          if (id === requestId.current) {
            setResult({
              ok: false,
              query: q,
              setId: activeSet?.id ?? null,
              cards: [],
              source: '',
              fetchedAt: new Date().toISOString(),
              error: 'Could not reach the pricing service.',
            });
          }
        })
        .finally(() => {
          if (id === requestId.current) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [query, activeSet, endpoint]);

  const browsing = !query.trim() && !activeSet;

  return (
    <div className="space-y-4 pb-6 pt-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Search</h1>
        <p className="mt-1 text-sm text-slate-500">
          Live Pokémon card prices — real data from the Pokémon TCG API.
        </p>
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.04] px-4 py-3">
        <SearchIcon className="h-5 w-5 shrink-0 text-slate-500" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            activeSet
              ? `Search within ${activeSet.name}`
              : 'Search a Pokémon card, e.g. Pikachu'
          }
          className="w-full bg-transparent text-[15px] text-white placeholder:text-slate-500 focus:outline-none"
          aria-label="Search for a Pokémon card"
        />
      </label>

      {activeSet && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveSet(null);
              setQuery('');
            }}
            className="shrink-0 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-slate-300"
          >
            ‹ Sets
          </button>
          <span className="truncate text-sm font-semibold text-white">
            {activeSet.name}
          </span>
        </div>
      )}

      {browsing && (
        <>
          <p className="text-sm text-slate-400">
            Search any Pokémon card for its live market price.
          </p>
          <p className="text-xs text-slate-500">
            One Piece and other games aren&apos;t connected to live pricing yet.
          </p>

          <h2 className="pt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Browse by set
          </h2>
          {sets === null && !setsError && (
            <p className="py-6 text-center text-sm text-slate-500">
              Loading sets…
            </p>
          )}
          {setsError && (
            <p className="py-2 text-center text-xs text-amber-200/80">
              {setsError}
            </p>
          )}
          {sets && sets.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {sets.map((set) => (
                <SetTile key={set.id} set={set} onSelect={setActiveSet} />
              ))}
            </div>
          )}
        </>
      )}

      {!browsing && loading && (
        <p className="py-8 text-center text-sm text-slate-500">Searching…</p>
      )}

      {!browsing && !loading && result && !result.ok && (
        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-center">
          <p className="text-sm text-amber-200">
            {result.error ?? 'Could not reach the pricing service.'}
          </p>
          <p className="mt-1 text-xs text-amber-200/70">
            Try again in a moment.
          </p>
        </div>
      )}

      {!browsing && !loading && result?.ok && (
        <>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-up" />
            Live · {result.source}
          </div>
          {result.cards.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No cards matched &ldquo;{result.query}&rdquo;.
            </p>
          ) : (
            <ul className="space-y-2">
              {result.cards.map((card) => (
                <PriceRow key={card.id} card={card} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
