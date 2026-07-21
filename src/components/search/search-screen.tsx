'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { CardSearchResult, PriceableCard } from '@/lib/pricing/types';
import { formatUsd2 } from '@/lib/format';
import { SearchIcon } from '@/components/app/icons';

// Live card search: type a Pokémon card name and get real market prices back
// from the pricing API route, which calls the Pokémon TCG API server-side.
// Pokémon only for now — no similarly clean official/free source exists yet
// for the other games in the catalog. Never shows cost or profit — only the
// same public market price anyone can see on the official service.

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

export function SearchScreen({
  endpoint = '/api/pricing/search',
}: {
  endpoint?: string;
}) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<CardSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResult(null);
      setLoading(false);
      return;
    }

    const id = ++requestId.current;
    setLoading(true);
    const handle = setTimeout(() => {
      fetch(`${endpoint}?q=${encodeURIComponent(q)}`)
        .then((res) => res.json() as Promise<CardSearchResult>)
        .then((data) => {
          if (id === requestId.current) setResult(data);
        })
        .catch(() => {
          if (id === requestId.current) {
            setResult({
              ok: false,
              query: q,
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
  }, [query, endpoint]);

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
          placeholder="Search a Pokémon card, e.g. Pikachu"
          className="w-full bg-transparent text-[15px] text-white placeholder:text-slate-500 focus:outline-none"
          aria-label="Search for a Pokémon card"
        />
      </label>

      {!query.trim() && (
        <div className="rounded-3xl border border-white/5 bg-white/[0.03] py-14 text-center">
          <p className="text-sm text-slate-400">
            Search any Pokémon card for its live market price.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            One Piece and other games aren&apos;t connected to live pricing yet.
          </p>
        </div>
      )}

      {query.trim() && loading && (
        <p className="py-8 text-center text-sm text-slate-500">Searching…</p>
      )}

      {query.trim() && !loading && result && !result.ok && (
        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-center">
          <p className="text-sm text-amber-200">
            {result.error ?? 'Could not reach the pricing service.'}
          </p>
          <p className="mt-1 text-xs text-amber-200/70">
            Try again in a moment.
          </p>
        </div>
      )}

      {query.trim() && !loading && result?.ok && (
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
