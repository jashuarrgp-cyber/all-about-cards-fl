// Presentation-only formatting helpers. These operate on numbers that are
// already display-ready; they do not perform financial math.

const usd0 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const usd2 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Whole-dollar currency, e.g. $10,153. */
export function formatUsd0(value: number): string {
  return usd0.format(value);
}

/** Cents-precision currency, e.g. $10,152.90. */
export function formatUsd2(value: number): string {
  return usd2.format(value);
}

/** Signed whole-dollar currency, e.g. +$3,838 / -$120. */
export function formatSignedUsd0(value: number): string {
  const sign = value >= 0 ? '+' : '-';
  return `${sign}${usd0.format(Math.abs(value))}`;
}

/** Signed percentage from a fraction, e.g. 0.608 -> +60.8%. */
export function formatSignedPct(fraction: number): string {
  const sign = fraction >= 0 ? '+' : '-';
  return `${sign}${(Math.abs(fraction) * 100).toFixed(1)}%`;
}

/** Compact integer, e.g. 461. */
export function formatCount(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
