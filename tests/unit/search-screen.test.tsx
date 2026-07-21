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
// "Price unavailable" case for a card with no market price), browsing by
// set, and a service failure — without ever pointing the real API route at
// a mock host (which would mean adding an SSRF-prone base-URL override just
// for tests). Provider parsing/network-degradation logic is covered
// separately in tests/unit/pricing.test.ts against realistic API fixtures.

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const EMPTY_SETS_BODY = {
  ok: true,
  sets: [],
  source: '',
  fetchedAt: new Date().toISOString(),
};

const SUCCESS_BODY = {
  ok: true,
  query: 'pikachu',
  setId: null,
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

const SETS_BODY = {
  ok: true,
  source: 'TCGplayer market price via the Pokémon TCG API',
  fetchedAt: new Date().toISOString(),
  sets: [
    {
      id: 'swsh7',
      name: 'Evolving Skies',
      series: 'Sword & Shield',
      releaseDate: '2021/08/27',
      total: 237,
      logo: 'https://images.pokemontcg.io/swsh7/logo.png',
      symbol: 'https://images.pokemontcg.io/swsh7/symbol.png',
    },
  ],
};

describe('SearchScreen', () => {
  it('shows the empty prompt and loads sets to browse before typing anything', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: async () => EMPTY_SETS_BODY }),
    );
    render(<SearchScreen />);
    expect(screen.getByText(/Search any Pokémon card/)).toBeTruthy();
    expect(screen.getByText('Browse by set')).toBeTruthy();
    // Wait for the sets fetch to settle so its state update doesn't leak
    // into the next test.
    await waitFor(() => expect(screen.queryByText('Loading sets…')).toBeNull());
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
          setId: null,
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

  it('lets you browse a set and see its cards', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/sets')) {
          return Promise.resolve({ json: async () => SETS_BODY });
        }
        return Promise.resolve({ json: async () => SUCCESS_BODY });
      }),
    );

    render(<SearchScreen />);

    await waitFor(() =>
      expect(screen.getByText('Evolving Skies')).toBeTruthy(),
    );
    fireEvent.click(screen.getByText('Evolving Skies'));

    // Back button + set name header appear once a set is active.
    expect(screen.getByText('‹ Sets')).toBeTruthy();

    await waitFor(() => expect(screen.getByText('$2.10')).toBeTruthy(), {
      timeout: 2000,
    });

    // The request for cards was scoped to the selected set.
    const fetchMock = global.fetch as ReturnType<typeof vi.fn>;
    const setCardCall = fetchMock.mock.calls.find((call) =>
      String(call[0]).includes('setId=swsh7'),
    );
    expect(setCardCall).toBeTruthy();

    fireEvent.click(screen.getByText('‹ Sets'));
    expect(screen.getByText('Browse by set')).toBeTruthy();
  });

  it('opens a card detail view on tap, without an Add to Collection section when no handler is given', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: async () => SUCCESS_BODY }),
    );

    render(<SearchScreen />);
    fireEvent.change(screen.getByLabelText('Search for a Pokémon card'), {
      target: { value: 'pikachu' },
    });
    await waitFor(() => expect(screen.getByText('$2.10')).toBeTruthy());

    fireEvent.click(screen.getAllByText('Pikachu')[0]);

    expect(screen.getByRole('heading', { name: 'Pikachu' })).toBeTruthy();
    expect(screen.getByText('Live market price')).toBeTruthy();
    expect(screen.queryByText('Add to your collection')).toBeNull();

    fireEvent.click(screen.getByText('‹ Back'));
    expect(screen.getByLabelText('Search for a Pokémon card')).toBeTruthy();
  });

  it('adds a card to the collection and shows a success message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: async () => SUCCESS_BODY }),
    );
    const onAddToCollection = vi.fn().mockResolvedValue({ ok: true });

    render(<SearchScreen onAddToCollection={onAddToCollection} />);
    fireEvent.change(screen.getByLabelText('Search for a Pokémon card'), {
      target: { value: 'pikachu' },
    });
    await waitFor(() => expect(screen.getByText('$2.10')).toBeTruthy());
    fireEvent.click(screen.getAllByText('Pikachu')[0]);

    expect(screen.getByText('Add to your collection')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));
    fireEvent.change(screen.getByLabelText('What did you pay for this card'), {
      target: { value: '12.50' },
    });
    fireEvent.click(screen.getByText('Add to Collection'));

    await waitFor(() =>
      expect(screen.getByText('Added to your collection.')).toBeTruthy(),
    );
    expect(onAddToCollection).toHaveBeenCalledWith(
      expect.objectContaining({
        externalId: 'swsh7-8',
        name: 'Pikachu',
        quantity: 2,
        acquisitionUnitCost: '12.50',
      }),
    );
  });

  it('shows an error message when adding to the collection fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: async () => SUCCESS_BODY }),
    );
    const onAddToCollection = vi
      .fn()
      .mockResolvedValue({ ok: false, error: 'Something went wrong.' });

    render(<SearchScreen onAddToCollection={onAddToCollection} />);
    fireEvent.change(screen.getByLabelText('Search for a Pokémon card'), {
      target: { value: 'pikachu' },
    });
    await waitFor(() => expect(screen.getByText('$2.10')).toBeTruthy());
    fireEvent.click(screen.getAllByText('Pikachu')[0]);
    fireEvent.click(screen.getByText('Add to Collection'));

    await waitFor(() =>
      expect(screen.getByText('Something went wrong.')).toBeTruthy(),
    );
  });
});
