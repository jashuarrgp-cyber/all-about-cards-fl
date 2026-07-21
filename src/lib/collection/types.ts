// Shared types for the Collection tab. Display-ready shapes only — no cost
// or profit fields, ever: this screen is collector-facing by design.

export type CollectionKind = 'RAW' | 'GRADED' | 'SEALED';

export interface CollectionItem {
  id: string;
  name: string;
  /** Set or product line, e.g. "Two Legends". */
  setName: string | null;
  /** Collector number, e.g. "OP08-023". */
  cardNumber: string | null;
  /** Display label for the game, e.g. "One Piece". */
  game: string;
  kind: CollectionKind;
  /** Copies on hand (1 for individually tracked items). */
  quantity: number;
  /** e.g. "PSA 10" for graded items. */
  gradeLabel: string | null;
  /** Tile accent color derived from the game. */
  accentColor: string;
}

export interface CollectionSnapshot {
  items: CollectionItem[];
  /** True when items came from the live inventory database. */
  isLive: boolean;
}
