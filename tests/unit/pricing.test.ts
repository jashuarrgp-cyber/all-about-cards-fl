import { describe, expect, it, vi } from 'vitest';
import {
  listPokemonSets,
  searchPokemonCards,
} from '@/lib/pricing/pokemon-tcg-provider';

// Fixtures shaped like real Pokémon TCG API v2 responses
// (https://docs.pokemontcg.io/api-reference/cards/search-cards), so the
// mapping logic is verified against the provider's actual schema.

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

const HOLO_CARD = {
  id: 'swsh7-8',
  name: 'Pikachu',
  number: '8',
  rarity: 'Common',
  set: { name: 'Evolving Skies', series: 'Sword & Shield' },
  images: {
    small: 'https://images.pokemontcg.io/swsh7/8.png',
    large: 'https://images.pokemontcg.io/swsh7/8_hires.png',
  },
  tcgplayer: {
    url: 'https://prices.pokemontcg.io/tcgplayer/swsh7-8',
    updatedAt: '2026/07/01',
    prices: {
      normal: { low: 0.1, mid: 0.25, high: 1.5, market: 0.19 },
      holofoil: { low: 1.2, mid: 2.5, high: 8, market: 2.1 },
    },
  },
};

// An older-era card priced only under a variant name our fixed priority
// list doesn't enumerate (real cards use many historical print-variant
// names — "unlimited", "1stEdition", etc.) — should still surface a price
// via the fallback rather than reporting "Price unavailable".
const UNKNOWN_VARIANT_CARD = {
  id: 'base1-4',
  name: 'Charizard',
  number: '4',
  rarity: 'Rare Holo',
  set: { name: 'Base', series: 'Base' },
  images: { small: 'https://images.pokemontcg.io/base1/4.png' },
  tcgplayer: {
    prices: {
      unlimitedHolofoil: { low: 200, mid: 350, high: 900, market: 375.5 },
    },
  },
};

const NO_PRICE_CARD = {
  id: 'base1-1',
  name: 'Alakazam',
  number: '1',
  rarity: 'Rare Holo',
  set: { name: 'Base', series: 'Base' },
  images: { small: 'https://images.pokemontcg.io/base1/1.png' },
  // No tcgplayer field at all — some cards have no pricing data.
};

describe('searchPokemonCards', () => {
  it('returns an empty ok result without calling fetch for a blank query', async () => {
    const fetchImpl = vi.fn();
    const result = await searchPokemonCards('   ', { fetchImpl });
    expect(result.ok).toBe(true);
    expect(result.cards).toEqual([]);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('maps a successful response, preferring holofoil market price', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse({ data: [HOLO_CARD, NO_PRICE_CARD] }));
    const result = await searchPokemonCards('pikachu', { fetchImpl });

    expect(result.ok).toBe(true);
    expect(result.cards).toHaveLength(2);

    const pikachu = result.cards[0];
    expect(pikachu.name).toBe('Pikachu');
    expect(pikachu.setName).toBe('Evolving Skies');
    expect(pikachu.number).toBe('8');
    expect(pikachu.marketPrice).toBe(2.1); // holofoil beats normal

    const alakazam = result.cards[1];
    expect(alakazam.marketPrice).toBeNull();
    expect(alakazam.setName).toBe('Base');
  });

  it('falls back to any priced variant when none of the common names match', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse({ data: [UNKNOWN_VARIANT_CARD] }));
    const result = await searchPokemonCards('charizard', { fetchImpl });

    expect(result.cards).toHaveLength(1);
    expect(result.cards[0].marketPrice).toBe(375.5);
  });

  it('builds the request URL with a wildcard name query and API key header', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ data: [] }));
    await searchPokemonCards('char"iz\\ard', {
      fetchImpl,
      apiKey: 'test-key-123',
      baseUrl: 'https://example.test/v2',
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toContain('https://example.test/v2/cards?q=');
    // Quotes/backslashes stripped before building the query.
    expect(decodeURIComponent(url)).toContain('name:"charizard*"');
    expect(init.headers).toEqual({ 'X-Api-Key': 'test-key-123' });
    // Prices change — never let this be served from a cache.
    expect(init.cache).toBe('no-store');
  });

  it('degrades gracefully on a non-OK HTTP status', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}, 503));
    const result = await searchPokemonCards('pikachu', { fetchImpl });
    expect(result.ok).toBe(false);
    expect(result.cards).toEqual([]);
    expect(result.error).toContain('503');
  });

  it('degrades gracefully when fetch rejects (network failure)', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('network down'));
    const result = await searchPokemonCards('pikachu', { fetchImpl });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Could not reach');
  });

  it('reports a timeout distinctly from other failures', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    const fetchImpl = vi.fn().mockRejectedValue(abortError);
    const result = await searchPokemonCards('pikachu', {
      fetchImpl,
      timeoutMs: 1,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('too long');
  });

  it('ignores malformed entries in the data array instead of crashing', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ data: [null, { id: 'x' }, HOLO_CARD, 'not-an-object'] }),
      );
    const result = await searchPokemonCards('pikachu', { fetchImpl });
    expect(result.ok).toBe(true);
    // null, id-without-name, and the string are all dropped; only the valid
    // card with both id and name survives.
    expect(result.cards).toHaveLength(1);
    expect(result.cards[0].id).toBe('swsh7-8');
  });

  it('combines a name query with a setId into one query string', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ data: [] }));
    await searchPokemonCards('pikachu', {
      fetchImpl,
      setId: 'swsh7',
      baseUrl: 'https://example.test/v2',
    });

    const [url] = fetchImpl.mock.calls[0];
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('name:"pikachu*"');
    expect(decoded).toContain('set.id:swsh7');
  });

  it('searches by setId alone when no name is given', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ data: [] }));
    const result = await searchPokemonCards('', {
      fetchImpl,
      setId: 'swsh7',
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(decodeURIComponent(fetchImpl.mock.calls[0][0])).toContain(
      'set.id:swsh7',
    );
    expect(result.setId).toBe('swsh7');
  });

  it('returns an empty ok result without fetching when neither name nor setId is given', async () => {
    const fetchImpl = vi.fn();
    const result = await searchPokemonCards('  ', { fetchImpl });
    expect(result.ok).toBe(true);
    expect(result.setId).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

const SET_FIXTURE = {
  id: 'swsh7',
  name: 'Evolving Skies',
  series: 'Sword & Shield',
  printedTotal: 203,
  total: 237,
  releaseDate: '2021/08/27',
  images: {
    symbol: 'https://images.pokemontcg.io/swsh7/symbol.png',
    logo: 'https://images.pokemontcg.io/swsh7/logo.png',
  },
};

describe('listPokemonSets', () => {
  it('maps a successful response to set summaries', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse({ data: [SET_FIXTURE] }));
    const result = await listPokemonSets({ fetchImpl });

    expect(result.ok).toBe(true);
    expect(result.sets).toHaveLength(1);
    expect(result.sets[0]).toMatchObject({
      id: 'swsh7',
      name: 'Evolving Skies',
      series: 'Sword & Shield',
      releaseDate: '2021/08/27',
      total: 237,
      logo: 'https://images.pokemontcg.io/swsh7/logo.png',
    });
    // Prices/set data change — never let this be served from a cache.
    expect(fetchImpl.mock.calls[0][1].cache).toBe('no-store');
  });

  it('degrades gracefully on a non-OK status', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}, 500));
    const result = await listPokemonSets({ fetchImpl });
    expect(result.ok).toBe(false);
    expect(result.sets).toEqual([]);
    expect(result.error).toContain('500');
  });

  it('degrades gracefully on a network failure', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('offline'));
    const result = await listPokemonSets({ fetchImpl });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Could not reach');
  });

  it('drops malformed set entries', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ data: [null, { id: 'x' }, SET_FIXTURE] }),
      );
    const result = await listPokemonSets({ fetchImpl });
    expect(result.sets).toHaveLength(1);
    expect(result.sets[0].id).toBe('swsh7');
  });
});
