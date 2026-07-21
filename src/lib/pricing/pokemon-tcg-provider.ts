import 'server-only';
import type {
  CardSearchResult,
  PriceableCard,
  SetListResult,
  SetSummary,
} from './types';

// Live pricing provider backed by the Pokémon TCG API (https://pokemontcg.io),
// a free, public, official third-party catalog that republishes TCGplayer
// market prices. No API key is required for normal use; an optional key
// (POKEMON_TCG_API_KEY) raises the rate limit. This is deliberately the only
// provider for now — it only covers Pokémon. Per docs/INTEGRATIONS.md, we do
// not scrape or assume direct TCGplayer/eBay/PSA access.
//
// Server-only: keeps any future API key off the client, and lets the search
// route apply a request timeout and degrade gracefully instead of throwing.

const DEFAULT_BASE_URL = 'https://api.pokemontcg.io/v2';
const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_PAGE_SIZE = 20;
export const PRICE_SOURCE_LABEL =
  'TCGplayer market price via the Pokémon TCG API';

// Preference order when a card has multiple print variants priced
// separately (e.g. holofoil vs normal). First match wins.
const VARIANT_PRIORITY = [
  'holofoil',
  'reverseHolofoil',
  'normal',
  '1stEditionHolofoil',
  '1stEditionNormal',
] as const;

export interface SearchOptions {
  /** Narrows results to one set, e.g. "swsh7". Combines with a name query. */
  setId?: string;
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  pageSize?: number;
}

export async function searchPokemonCards(
  query: string,
  options: SearchOptions = {},
): Promise<CardSearchResult> {
  const trimmed = query.trim();
  const setId = options.setId?.trim() || null;
  const fetchedAt = new Date().toISOString();

  if (!trimmed && !setId) {
    return {
      ok: true,
      query: trimmed,
      setId,
      cards: [],
      source: PRICE_SOURCE_LABEL,
      fetchedAt,
    };
  }

  const {
    apiKey = '',
    baseUrl = DEFAULT_BASE_URL,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    fetchImpl = fetch,
    pageSize = DEFAULT_PAGE_SIZE,
  } = options;

  // Strip characters that could break the provider's query syntax.
  const clauses: string[] = [];
  if (trimmed) {
    const safeName = trimmed.replace(/["\\]/g, '');
    clauses.push(`name:"${safeName}*"`);
  }
  if (setId) {
    clauses.push(`set.id:${setId.replace(/["\\\s]/g, '')}`);
  }
  const q = clauses.join(' ');
  const url = `${baseUrl}/cards?q=${encodeURIComponent(q)}&pageSize=${pageSize}&orderBy=number`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchImpl(url, {
      signal: controller.signal,
      headers: apiKey ? { 'X-Api-Key': apiKey } : undefined,
      // Prices change; never let Next's server-side fetch cache serve a
      // stale response for this call.
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        ok: false,
        query: trimmed,
        setId,
        cards: [],
        source: PRICE_SOURCE_LABEL,
        fetchedAt,
        error: `Pricing service returned an error (${res.status}).`,
      };
    }

    const body = (await res.json()) as { data?: unknown[] };
    const cards = Array.isArray(body.data)
      ? body.data.map(mapCard).filter((c): c is PriceableCard => c !== null)
      : [];

    return {
      ok: true,
      query: trimmed,
      setId,
      cards,
      source: PRICE_SOURCE_LABEL,
      fetchedAt,
    };
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'AbortError';
    return {
      ok: false,
      query: trimmed,
      setId,
      cards: [],
      source: PRICE_SOURCE_LABEL,
      fetchedAt,
      error: timedOut
        ? 'The pricing service took too long to respond.'
        : 'Could not reach the pricing service.',
    };
  } finally {
    clearTimeout(timeout);
  }
}

export interface ListSetsOptions {
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  pageSize?: number;
}

export async function listPokemonSets(
  options: ListSetsOptions = {},
): Promise<SetListResult> {
  const {
    apiKey = '',
    baseUrl = DEFAULT_BASE_URL,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    fetchImpl = fetch,
    pageSize = 60,
  } = options;
  const fetchedAt = new Date().toISOString();

  const url = `${baseUrl}/sets?pageSize=${pageSize}&orderBy=-releaseDate`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchImpl(url, {
      signal: controller.signal,
      headers: apiKey ? { 'X-Api-Key': apiKey } : undefined,
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        ok: false,
        sets: [],
        source: PRICE_SOURCE_LABEL,
        fetchedAt,
        error: `Pricing service returned an error (${res.status}).`,
      };
    }

    const body = (await res.json()) as { data?: unknown[] };
    const sets = Array.isArray(body.data)
      ? body.data.map(mapSet).filter((s): s is SetSummary => s !== null)
      : [];

    return { ok: true, sets, source: PRICE_SOURCE_LABEL, fetchedAt };
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'AbortError';
    return {
      ok: false,
      sets: [],
      source: PRICE_SOURCE_LABEL,
      fetchedAt,
      error: timedOut
        ? 'The pricing service took too long to respond.'
        : 'Could not reach the pricing service.',
    };
  } finally {
    clearTimeout(timeout);
  }
}

function mapSet(raw: unknown): SetSummary | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === 'string' ? raw.id : null;
  const name = typeof raw.name === 'string' ? raw.name : null;
  if (!id || !name) return null;

  const images = isRecord(raw.images) ? raw.images : {};

  return {
    id,
    name,
    series: typeof raw.series === 'string' ? raw.series : null,
    releaseDate: typeof raw.releaseDate === 'string' ? raw.releaseDate : null,
    total: typeof raw.total === 'number' ? raw.total : null,
    logo: typeof images.logo === 'string' ? images.logo : null,
    symbol: typeof images.symbol === 'string' ? images.symbol : null,
  };
}

function mapCard(raw: unknown): PriceableCard | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === 'string' ? r.id : null;
  const name = typeof r.name === 'string' ? r.name : null;
  if (!id || !name) return null;

  const set = isRecord(r.set) ? r.set : {};
  const images = isRecord(r.images) ? r.images : {};

  return {
    id,
    name,
    number: typeof r.number === 'string' ? r.number : null,
    setName: typeof set.name === 'string' ? set.name : 'Unknown set',
    setSeries: typeof set.series === 'string' ? set.series : null,
    rarity: typeof r.rarity === 'string' ? r.rarity : null,
    imageSmall: typeof images.small === 'string' ? images.small : null,
    imageLarge: typeof images.large === 'string' ? images.large : null,
    marketPrice: pickMarketPrice(r.tcgplayer),
  };
}

function marketPriceOf(variant: unknown): number | null {
  if (!isRecord(variant)) return null;
  const market = variant.market;
  return typeof market === 'number' && Number.isFinite(market) ? market : null;
}

function pickMarketPrice(tcgplayer: unknown): number | null {
  if (!isRecord(tcgplayer)) return null;
  const prices = tcgplayer.prices;
  if (!isRecord(prices)) return null;

  // Prefer the common modern-era variant names in a sensible order first.
  for (const key of VARIANT_PRIORITY) {
    const price = marketPriceOf(prices[key]);
    if (price !== null) return price;
  }

  // Pokémon has many historical print variants this list can't fully
  // enumerate (e.g. "unlimited", "1stEdition", "unlimitedHolofoil" on older
  // sets). Fall back to any variant that actually has a usable price rather
  // than showing "Price unavailable" for a card that has one.
  for (const key of Object.keys(prices)) {
    const price = marketPriceOf(prices[key]);
    if (price !== null) return price;
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
