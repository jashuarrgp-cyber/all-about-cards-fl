'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type {
  CardSearchResult,
  PriceableCard,
  SetListResult,
  SetSummary,
} from '@/lib/pricing/types';
import type {
  AddFromSearchInput,
  AddFromSearchResult,
} from '@/lib/collection/add-from-search';
import { formatUsd2 } from '@/lib/format';
import { SearchIcon } from '@/components/app/icons';

// Live card search: type a Pokémon card name and get real market prices back
// from the pricing API route, which calls the Pokémon TCG API server-side.
// Also supports browsing by set, and tapping a card for a detail view with
// an optional "Add to Collection" action. Pokémon only for now — no
// similarly clean official/free source exists yet for the other games in
// the catalog. Never shows cost or profit — only the same public market
// price anyone can see on the official service.

const DEBOUNCE_MS = 350;

/** Image that falls back to the placeholder box if the URL fails to load. */
function CardThumb({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string | null;
  alt: string;
  width: number;
  height: number;
  className: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <span className={`${className} bg-white/10`} />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

function PriceRow({
  card,
  onSelect,
}: {
  card: PriceableCard;
  onSelect: (card: PriceableCard) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(card)}
        className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-left"
      >
        <CardThumb
          src={card.imageSmall}
          alt={card.name}
          width={40}
          height={56}
          className="h-14 w-10 shrink-0 rounded-md object-cover"
        />
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
          <div className="shrink-0 text-xs text-slate-500">
            Price unavailable
          </div>
        )}
      </button>
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
      <CardThumb
        src={set.logo}
        alt=""
        width={96}
        height={40}
        className="h-10 w-24 object-contain"
      />
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

function CardDetailView({
  card,
  onBack,
  onAddToCollection,
}: {
  card: PriceableCard;
  onBack: () => void;
  onAddToCollection?: (
    input: AddFromSearchInput,
  ) => Promise<AddFromSearchResult>;
}) {
  const [quantity, setQuantity] = useState(1);
  const [cost, setCost] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>(
    'idle',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!onAddToCollection) return;
    setStatus('saving');
    setErrorMessage(null);
    const result = await onAddToCollection({
      externalId: card.id,
      name: card.name,
      setName: card.setName,
      cardNumber: card.number,
      rarity: card.rarity,
      quantity,
      acquisitionUnitCost: cost.trim(),
    });
    if (result.ok) {
      setStatus('done');
    } else {
      setStatus('error');
      setErrorMessage(result.error ?? 'Could not add this to your collection.');
    }
  };

  return (
    <div>
      <button type="button" onClick={onBack} className="text-sm text-slate-400">
        ‹ Back
      </button>

      <div className="mt-4 flex flex-col items-center">
        <CardThumb
          src={card.imageLarge ?? card.imageSmall}
          alt={card.name}
          width={220}
          height={307}
          className="w-full max-w-[220px] rounded-2xl object-contain"
        />
        <h1 className="mt-4 text-center text-xl font-bold text-white">
          {card.name}
        </h1>
        <p className="mt-1 text-center text-sm text-slate-400">
          {card.setName}
          {card.setSeries ? ` · ${card.setSeries}` : ''}
        </p>
        <p className="text-center text-xs text-slate-500">
          {[card.number ? `#${card.number}` : null, card.rarity]
            .filter(Boolean)
            .join(' · ')}
        </p>

        <div className="mt-4 w-full overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]">
          <div className="px-6 py-4 text-center">
            {card.marketPrice !== null ? (
              <>
                <div className="text-3xl font-bold tabular-nums text-white">
                  {formatUsd2(card.marketPrice)}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  Live market price · TCGplayer
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-500">Price unavailable</div>
            )}
          </div>

          {(card.priceLow !== null || card.priceHigh !== null) && (
            <div className="grid grid-cols-2 divide-x divide-white/5 border-t border-white/5">
              <div className="px-3 py-2.5 text-center">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Low
                </div>
                <div className="mt-0.5 text-sm font-semibold tabular-nums text-white">
                  {card.priceLow !== null ? formatUsd2(card.priceLow) : '—'}
                </div>
              </div>
              <div className="px-3 py-2.5 text-center">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  High
                </div>
                <div className="mt-0.5 text-sm font-semibold tabular-nums text-white">
                  {card.priceHigh !== null ? formatUsd2(card.priceHigh) : '—'}
                </div>
              </div>
            </div>
          )}

          {card.tcgplayerUrl && (
            <a
              href={card.tcgplayerUrl}
              target="_blank"
              rel="noreferrer"
              className="block border-t border-white/5 px-4 py-3 text-center text-xs font-semibold text-brand-teal"
            >
              Full price history &amp; recent sales on TCGplayer ↗
            </a>
          )}
        </div>
      </div>

      {onAddToCollection && (
        <div className="mt-6 rounded-3xl border border-white/5 bg-white/[0.03] p-5">
          {status === 'done' ? (
            <div className="text-center">
              <p className="text-sm font-semibold text-brand-up">
                Added to your collection.
              </p>
              <button
                type="button"
                onClick={onBack}
                className="mt-4 w-full rounded-2xl bg-brand-teal py-3 text-sm font-bold text-base-950"
              >
                Back to search
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-sm font-semibold text-white">
                Add to your collection
              </h2>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-slate-400">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="h-8 w-8 rounded-full bg-white/[0.06] font-bold text-slate-300"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                    className="h-8 w-8 rounded-full bg-white/[0.06] font-bold text-slate-300"
                  >
                    +
                  </button>
                </div>
              </div>
              <label className="mt-3 block">
                <span className="text-sm text-slate-400">
                  What did you pay? (optional — you can update this later)
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[15px] text-white placeholder:text-slate-500 focus:outline-none"
                  aria-label="What did you pay for this card"
                />
              </label>
              {status === 'error' && (
                <p className="mt-3 text-xs text-amber-200">{errorMessage}</p>
              )}
              <button
                type="button"
                onClick={handleAdd}
                disabled={status === 'saving'}
                className="mt-4 w-full rounded-2xl bg-brand-teal py-3 text-sm font-bold text-base-950 disabled:opacity-50"
              >
                {status === 'saving' ? 'Adding…' : 'Add to Collection'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function SearchScreen({
  endpoint = '/api/pricing/search',
  setsEndpoint = '/api/pricing/sets',
  onAddToCollection,
}: {
  endpoint?: string;
  setsEndpoint?: string;
  onAddToCollection?: (
    input: AddFromSearchInput,
  ) => Promise<AddFromSearchResult>;
}) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<CardSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  const [sets, setSets] = useState<SetSummary[] | null>(null);
  const [setsError, setSetsError] = useState<string | null>(null);
  const [activeSet, setActiveSet] = useState<SetSummary | null>(null);
  const [activeCard, setActiveCard] = useState<PriceableCard | null>(null);

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

  if (activeCard) {
    return (
      <div className="pb-6 pt-5">
        <CardDetailView
          card={activeCard}
          onBack={() => setActiveCard(null)}
          onAddToCollection={onAddToCollection}
        />
      </div>
    );
  }

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
                <PriceRow key={card.id} card={card} onSelect={setActiveCard} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
