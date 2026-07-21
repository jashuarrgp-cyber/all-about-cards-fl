// Matchable catalog for the scan flow, with sample market prices (labeled as
// sample in the UI). When automatic card recognition and licensed live
// pricing land, they plug into this same shape.

export interface ScanCatalogEntry {
  id: string;
  name: string;
  cardNumber: string;
  setName: string;
  game: string;
  /** Sample market price in USD. */
  marketPrice: number;
  accentColor: string;
}

export const scanCatalog: ScanCatalogEntry[] = [
  {
    id: 'sc1',
    name: 'Carrot',
    cardNumber: 'EB03-013',
    setName: 'One Piece Heroines Edition',
    game: 'One Piece',
    marketPrice: 0.19,
    accentColor: '#2f9e44',
  },
  {
    id: 'sc2',
    name: 'Carrot',
    cardNumber: 'EB04-013',
    setName: "The Azure Sea's Seven",
    game: 'One Piece',
    marketPrice: 0.39,
    accentColor: '#37b24d',
  },
  {
    id: 'sc3',
    name: 'Carrot (Parallel)',
    cardNumber: 'OP08-023',
    setName: 'Two Legends',
    game: 'One Piece',
    marketPrice: 20.59,
    accentColor: '#e8590c',
  },
  {
    id: 'sc4',
    name: 'Carrot (CS 25-26 Event Pack)',
    cardNumber: 'P-070',
    setName: 'One Piece Promotion Cards',
    game: 'One Piece',
    marketPrice: 22.74,
    accentColor: '#0ca678',
  },
  {
    id: 'sc5',
    name: 'Shanks (Winner Pack 2026 Vol. 2)',
    cardNumber: 'P-104',
    setName: 'One Piece Promotion Cards',
    game: 'One Piece',
    marketPrice: 12.42,
    accentColor: '#7048e8',
  },
  {
    id: 'sc6',
    name: 'O-Nami (Illustration)',
    cardNumber: 'OP05-062',
    setName: 'Awakening of the New Era',
    game: 'One Piece',
    marketPrice: 35.28,
    accentColor: '#c92a2a',
  },
  {
    id: 'sc7',
    name: 'Boa Hancock (Alt Art)',
    cardNumber: 'OP12-014',
    setName: 'Legacy of the Master',
    game: 'One Piece',
    marketPrice: 30.26,
    accentColor: '#a61e4d',
  },
  {
    id: 'sc8',
    name: 'Garchomp ex',
    cardNumber: '245/182',
    setName: 'Paradox Rift',
    game: 'Pokémon',
    marketPrice: 36.45,
    accentColor: '#1c7ed6',
  },
  {
    id: 'sc9',
    name: 'Pikachu',
    cardNumber: '005/025',
    setName: 'Celebrations',
    game: 'Pokémon',
    marketPrice: 21.4,
    accentColor: '#f59f00',
  },
  {
    id: 'sc10',
    name: 'Donquixote Rosinante',
    cardNumber: 'OP12-108',
    setName: 'Legacy of the Master',
    game: 'One Piece',
    marketPrice: 41.56,
    accentColor: '#5f3dc4',
  },
];

export function searchScanCatalog(query: string): ScanCatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return scanCatalog;
  return scanCatalog.filter(
    (entry) =>
      entry.name.toLowerCase().includes(q) ||
      entry.cardNumber.toLowerCase().includes(q) ||
      entry.setName.toLowerCase().includes(q),
  );
}
