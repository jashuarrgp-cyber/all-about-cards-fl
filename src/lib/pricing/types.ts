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
  /** Public market price in USD, or null when the provider has none for this card. */
  marketPrice: number | null;
}

export interface CardSearchResult {
  ok: boolean;
  query: string;
  cards: PriceableCard[];
  /** Human-readable attribution for where the price data comes from. */
  source: string;
  fetchedAt: string;
  /** Present when ok is false — a short, user-safe reason. */
  error?: string;
}
