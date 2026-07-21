import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Verifies the actual route handler files — not just the provider — enforce
// that prices are never served stale: force-dynamic (no Next Route Handler
// caching) and an explicit no-store Cache-Control header on every response.
// The provider module is mocked so no real network call happens; separate
// tests in pricing.test.ts cover the provider's own no-store fetch option.

vi.mock('@/lib/pricing/pokemon-tcg-provider', () => ({
  searchPokemonCards: vi.fn().mockResolvedValue({
    ok: true,
    query: 'pikachu',
    setId: null,
    cards: [],
    source: 'test-source',
    fetchedAt: 'now',
  }),
  listPokemonSets: vi.fn().mockResolvedValue({
    ok: true,
    sets: [],
    source: 'test-source',
    fetchedAt: 'now',
  }),
}));

describe('pricing API routes', () => {
  it('marks both routes as force-dynamic so they are never statically cached', async () => {
    const searchRoute = await import('@/app/api/pricing/search/route');
    const setsRoute = await import('@/app/api/pricing/sets/route');
    expect(searchRoute.dynamic).toBe('force-dynamic');
    expect(setsRoute.dynamic).toBe('force-dynamic');
  });

  it('search route sends a no-store Cache-Control header and forwards q/setId', async () => {
    const { GET } = await import('@/app/api/pricing/search/route');
    const { searchPokemonCards } = await import(
      '@/lib/pricing/pokemon-tcg-provider'
    );

    const req = new NextRequest(
      'http://localhost/api/pricing/search?q=pikachu&setId=swsh7',
    );
    const res = await GET(req);

    expect(res.headers.get('cache-control')).toContain('no-store');
    expect(searchPokemonCards).toHaveBeenCalledWith(
      'pikachu',
      expect.objectContaining({ setId: 'swsh7' }),
    );
  });

  it('sets route sends a no-store Cache-Control header', async () => {
    const { GET } = await import('@/app/api/pricing/sets/route');
    const res = await GET();
    expect(res.headers.get('cache-control')).toContain('no-store');
  });
});
