// Shared types for the live pricing feature. A "priceable card" is a public
// catalog entry with a public market price — never internal cost or profit.

export interface PriceableCard {
  id: string;
  name: string;
  number: string | null;
  setName: string;
  setSeries: string | null;
  rarity: string | null;
  imageSmall: string | null;
  imageLarge: string | null;
  /** Public market price in USD, or null when the provider has none for this card. */
  marketPrice: number | null;
}

export interface CardSearchResult {
  ok: boolean;
  query: string;
  /** Set the search was narrowed to, if any. */
  setId: string | null;
  cards: PriceableCard[];
  /** Human-readable attribution for where the price data comes from. */
  source: string;
  fetchedAt: string;
  /** Present when ok is false — a short, user-safe reason. */
  error?: string;
}

export interface SetSummary {
  id: string;
  name: string;
  series: string | null;
  /** ISO-ish date string as published by the provider, e.g. "2021/08/27". */
  releaseDate: string | null;
  /** Total cards in the set, including secret rares. */
  total: number | null;
  logo: string | null;
  symbol: string | null;
}

export interface SetListResult {
  ok: boolean;
  sets: SetSummary[];
  source: string;
  fetchedAt: string;
  error?: string;
}
