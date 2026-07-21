import 'server-only';
import type { CardSearchResult, PriceableCard } from './types';

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
  const fetchedAt = new Date().toISOString();

  if (!trimmed) {
    return {
      ok: true,
      query: trimmed,
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
  const safeName = trimmed.replace(/["\\]/g, '');
  const q = `name:"${safeName}*"`;
  const url = `${baseUrl}/cards?q=${encodeURIComponent(q)}&pageSize=${pageSize}&orderBy=-set.releaseDate`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchImpl(url, {
      signal: controller.signal,
      headers: apiKey ? { 'X-Api-Key': apiKey } : undefined,
    });

    if (!res.ok) {
      return {
        ok: false,
        query: trimmed,
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
      cards,
      source: PRICE_SOURCE_LABEL,
      fetchedAt,
    };
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'AbortError';
    return {
      ok: false,
      query: trimmed,
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
    marketPrice: pickMarketPrice(r.tcgplayer),
  };
}

function pickMarketPrice(tcgplayer: unknown): number | null {
  if (!isRecord(tcgplayer)) return null;
  const prices = tcgplayer.prices;
  if (!isRecord(prices)) return null;

  for (const key of VARIANT_PRIORITY) {
    const variant = prices[key];
    if (isRecord(variant)) {
      const market = variant.market;
      if (typeof market === 'number' && Number.isFinite(market)) return market;
    }
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
