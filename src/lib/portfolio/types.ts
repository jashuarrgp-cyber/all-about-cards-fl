// Shared types for the portfolio dashboard (mobile collector experience).
// These describe a display-ready snapshot; all money values are plain numbers
// already rounded for presentation. Cost/profit are intentionally absent —
// this screen never exposes internal cost basis.

export type Timeframe = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

export interface ValuePoint {
  /** ISO date for the sample; used only for ordering/labels. */
  t: string;
  /** Portfolio value at this point, in USD. */
  v: number;
}

export interface ValueSeries {
  timeframe: Timeframe;
  points: ValuePoint[];
  /** Change over the window in USD. */
  changeAbs: number;
  /** Change over the window as a fraction (0.608 = +60.8%). */
  changePct: number;
}

export interface TopItem {
  id: string;
  name: string;
  subtitle: string;
  value: number;
  imageColor: string;
}

export interface BreakdownSlice {
  label: 'Sealed Products' | 'Raw Cards' | 'Graded Cards';
  value: number;
  color: string;
}

export interface PortfolioSnapshot {
  /** Current total portfolio value in USD. */
  totalValue: number;
  /** Value series keyed by timeframe for the interactive chart. */
  series: Record<Timeframe, ValueSeries>;
  counts: {
    raw: number;
    graded: number;
    sealed: number;
  };
  mostValuable: TopItem[];
  breakdown: BreakdownSlice[];
  /**
   * True when the item counts came from the live database.
   * When false, counts are sample values.
   */
  countsAreLive: boolean;
  /**
   * True when monetary values (total, chart, breakdown, most-valuable) are
   * sample figures rather than live market data. Live market pricing is a
   * later phase, so this is expected to be true for now.
   */
  valuesAreSample: boolean;
}
