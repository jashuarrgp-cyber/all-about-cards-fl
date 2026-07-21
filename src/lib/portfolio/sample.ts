import type {
  PortfolioSnapshot,
  Timeframe,
  ValuePoint,
  ValueSeries,
} from './types';

// Deterministic sample data for the portfolio dashboard. Used as a fallback
// when live data is unavailable and on the labeled /preview route. Numbers are
// illustrative only — they are not real inventory figures.

function buildPoints(start: number, end: number, count: number): ValuePoint[] {
  const points: ValuePoint[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  // Smooth S-curve from start -> end with mild jitter, deterministic.
  for (let i = 0; i < count; i += 1) {
    const p = i / (count - 1);
    const eased = 1 / (1 + Math.exp(-12 * (p - 0.42)));
    const jitter = Math.sin(i * 1.7) * (end - start) * 0.012;
    const v = start + (end - start) * eased + jitter;
    points.push({
      t: new Date(now - (count - 1 - i) * dayMs).toISOString().slice(0, 10),
      v: Math.round(v * 100) / 100,
    });
  }
  return points;
}

function toSeries(
  timeframe: Timeframe,
  start: number,
  end: number,
  count: number,
): ValueSeries {
  const points = buildPoints(start, end, count);
  const changeAbs = Math.round((end - start) * 100) / 100;
  const changePct = start > 0 ? changeAbs / start : 0;
  return { timeframe, points, changeAbs, changePct };
}

const TOTAL = 10152.9;

export const sampleSeries: Record<Timeframe, ValueSeries> = {
  '1W': toSeries('1W', 6314.9, TOTAL, 28),
  '1M': toSeries('1M', 5980.0, TOTAL, 30),
  '3M': toSeries('3M', 5210.0, TOTAL, 36),
  '6M': toSeries('6M', 4120.0, TOTAL, 42),
  '1Y': toSeries('1Y', 3480.0, TOTAL, 48),
  ALL: toSeries('ALL', 2110.0, TOTAL, 56),
};

export const sampleSnapshot: PortfolioSnapshot = {
  totalValue: TOTAL,
  series: sampleSeries,
  counts: { raw: 461, graded: 3, sealed: 11 },
  mostValuable: [
    {
      id: 's1',
      name: 'Evolving Skies Booster Box',
      subtitle: 'Pokémon · Sealed',
      value: 2601,
      imageColor: '#3b5bdb',
    },
    {
      id: 's2',
      name: 'Brilliant Stars Booster Box',
      subtitle: 'Pokémon · Sealed',
      value: 630.35,
      imageColor: '#2f9e44',
    },
    {
      id: 's3',
      name: 'One Piece OP-01 Booster Box',
      subtitle: 'One Piece · Sealed',
      value: 404,
      imageColor: '#c92a2a',
    },
    {
      id: 's4',
      name: 'Charizard ex 199/165',
      subtitle: 'Pokémon · Raw',
      value: 214.5,
      imageColor: '#e8590c',
    },
  ],
  breakdown: [
    { label: 'Sealed Products', value: 4992, color: '#8b7bf0' },
    { label: 'Raw Cards', value: 4947, color: '#22d3b7' },
    { label: 'Graded Cards', value: 213.84, color: '#f0a03c' },
  ],
  countsAreLive: false,
  valuesAreSample: true,
};
