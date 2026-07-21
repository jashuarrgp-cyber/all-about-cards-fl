import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { SearchScreen } from '@/components/search/search-screen';

// Component-level render test with a stubbed fetch. This verifies the UI
// itself renders correctly for a successful search (including the
// "Price unavailable" case for a card with no market price), and for a
// service failure — without ever pointing the real API route at a mock host
// (which would mean adding an SSRF-prone base-URL override just for tests).
// Provider parsing/network-degradation logic is covered separately in
// tests/unit/pricing.test.ts against realistic API fixtures.

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const SUCCESS_BODY = {
  ok: true,
  query: 'pikachu',
  source: 'TCGplayer market price via the Pokémon TCG API',
  fetchedAt: new Date().toISOString(),
  cards: [
    {
      id: 'swsh7-8',
      name: 'Pikachu',
      number: '8',
      setName: 'Evolving Skies',
      setSeries: 'Sword & Shield',
      rarity: 'Common',
      imageSmall: 'https://images.pokemontcg.io/swsh7/8.png',
      marketPrice: 2.1,
    },
    {
      id: 'base1-58',
      name: 'Pikachu',
      number: '58',
      setName: 'Base',
      setSeries: 'Base',
      rarity: 'Common',
      imageSmall: null,
      marketPrice: null,
    },
  ],
};

describe('SearchScreen', () => {
  it('shows the empty prompt before typing anything', () => {
    render(<SearchScreen />);
    expect(screen.getByText(/Search any Pokémon card/)).toBeTruthy();
  });

  it('renders a live price and a price-unavailable card after a successful search', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: async () => SUCCESS_BODY }),
    );

    render(<SearchScreen />);
    fireEvent.change(screen.getByLabelText('Search for a Pokémon card'), {
      target: { value: 'pikachu' },
    });

    await waitFor(() => expect(screen.getByText('$2.10')).toBeTruthy(), {
      timeout: 2000,
    });
    expect(screen.getByText('Price unavailable')).toBeTruthy();
    expect(screen.getAllByText(/Evolving Skies/).length).toBe(1);
  });

  it('shows an inline error banner when the service reports failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          ok: false,
          query: 'zzz',
          cards: [],
          source: '',
          fetchedAt: new Date().toISOString(),
          error: 'Pricing service returned an error (503).',
        }),
      }),
    );

    render(<SearchScreen />);
    fireEvent.change(screen.getByLabelText('Search for a Pokémon card'), {
      target: { value: 'zzz' },
    });

    await waitFor(
      () => expect(screen.getByText(/returned an error/)).toBeTruthy(),
      { timeout: 2000 },
    );
  });
});
