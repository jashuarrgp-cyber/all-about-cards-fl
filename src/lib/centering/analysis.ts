// Card centering analysis. Pure functions over plain pixel data so the same
// code runs in the browser (from a camera frame or uploaded photo) and in
// unit tests (from synthetic images). No DOM types are used.
//
// Approach: convert to grayscale, measure edge strength along each axis, and
// scan inward from each side to find (1) the outer card edge and (2) the
// inner printed-frame edge. Centering splits are the ratios of the opposing
// border widths, the same way graders describe them (e.g. "55/45 left/right").
// Detection is a starting point — the UI always allows manual fine-tuning.

export interface GrayImage {
  width: number;
  height: number;
  /** Row-major grayscale values, 0–255. */
  values: Float32Array;
}

export interface EdgeRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface CenteringResult {
  outer: EdgeRect;
  inner: EdgeRect;
}

export interface Splits {
  /** e.g. [55, 45] meaning left/right. Always sums to 100. */
  leftRight: [number, number];
  /** e.g. [52, 48] meaning top/bottom. Always sums to 100. */
  topBottom: [number, number];
}

export function toGrayImage(
  rgba: Uint8ClampedArray | number[],
  width: number,
  height: number,
): GrayImage {
  const values = new Float32Array(width * height);
  for (let i = 0; i < width * height; i += 1) {
    const o = i * 4;
    // Rec. 601 luma weights.
    values[i] = 0.299 * rgba[o] + 0.587 * rgba[o + 1] + 0.114 * rgba[o + 2];
  }
  return { width, height, values };
}

/**
 * Strength of vertical edges at each x position: mean |v(x+1,y) - v(x,y)|
 * over all rows. A vertical card edge shows up as a peak.
 */
export function verticalEdgeProfile(g: GrayImage): Float32Array {
  const profile = new Float32Array(Math.max(0, g.width - 1));
  for (let x = 0; x < g.width - 1; x += 1) {
    let sum = 0;
    for (let y = 0; y < g.height; y += 1) {
      const o = y * g.width + x;
      sum += Math.abs(g.values[o + 1] - g.values[o]);
    }
    profile[x] = sum / g.height;
  }
  return profile;
}

/** Strength of horizontal edges at each y position. */
export function horizontalEdgeProfile(g: GrayImage): Float32Array {
  const profile = new Float32Array(Math.max(0, g.height - 1));
  for (let y = 0; y < g.height - 1; y += 1) {
    let sum = 0;
    const row = y * g.width;
    const next = (y + 1) * g.width;
    for (let x = 0; x < g.width; x += 1) {
      sum += Math.abs(g.values[next + x] - g.values[row + x]);
    }
    profile[y] = sum / g.width;
  }
  return profile;
}

function firstPeakFrom(
  profile: Float32Array,
  from: number,
  to: number,
  threshold: number,
): number {
  const step = from <= to ? 1 : -1;
  for (let i = from; step > 0 ? i <= to : i >= to; i += step) {
    if (profile[i] >= threshold) return i;
  }
  return -1;
}

function maxOf(profile: Float32Array, from: number, to: number): number {
  let m = 0;
  for (let i = from; i <= to; i += 1) if (profile[i] > m) m = profile[i];
  return m;
}

/**
 * Detects outer card edges and inner printed-frame edges. Falls back to
 * sensible insets when a clean edge cannot be found, so the caller always
 * gets a usable starting rectangle for manual adjustment.
 */
export function detectCardEdges(g: GrayImage): CenteringResult {
  const vp = verticalEdgeProfile(g);
  const hp = horizontalEdgeProfile(g);

  const outer = { ...fallbackOuter(g) };
  const vMax = maxOf(vp, 0, vp.length - 1);
  const hMax = maxOf(hp, 0, hp.length - 1);
  const vThresh = vMax * 0.35;
  const hThresh = hMax * 0.35;

  // Outer edges: first strong edge scanning inward from each side, searching
  // at most 45% of the way in.
  const vSpan = Math.floor(vp.length * 0.45);
  const hSpan = Math.floor(hp.length * 0.45);
  const l = firstPeakFrom(vp, 0, vSpan, vThresh);
  const r = firstPeakFrom(vp, vp.length - 1, vp.length - 1 - vSpan, vThresh);
  const t = firstPeakFrom(hp, 0, hSpan, hThresh);
  const b = firstPeakFrom(hp, hp.length - 1, hp.length - 1 - hSpan, hThresh);
  if (l >= 0 && r > l) {
    outer.left = l + 1;
    outer.right = r;
  }
  if (t >= 0 && b > t) {
    outer.top = t + 1;
    outer.bottom = b;
  }

  const cardW = outer.right - outer.left;
  const cardH = outer.bottom - outer.top;

  // Inner frame: next strong edge inside the card, skipping a small gap past
  // the outer edge, searching up to ~22% of the card in. Threshold is
  // relative to the strongest edge in that window so faint frames register.
  const inner: EdgeRect = {
    left: innerEdge(vp, outer.left, cardW, +1),
    right: innerEdge(vp, outer.right, cardW, -1),
    top: innerEdge(hp, outer.top, cardH, +1),
    bottom: innerEdge(hp, outer.bottom, cardH, -1),
  };

  // Sanity: inner rect must be strictly inside and non-degenerate.
  if (
    !(
      inner.left < inner.right &&
      inner.top < inner.bottom &&
      inner.left > outer.left &&
      inner.right < outer.right &&
      inner.top > outer.top &&
      inner.bottom < outer.bottom
    )
  ) {
    inner.left = outer.left + Math.round(cardW * 0.07);
    inner.right = outer.right - Math.round(cardW * 0.07);
    inner.top = outer.top + Math.round(cardH * 0.07);
    inner.bottom = outer.bottom - Math.round(cardH * 0.07);
  }

  return { outer, inner };
}

function fallbackOuter(g: GrayImage): EdgeRect {
  return {
    left: Math.round(g.width * 0.05),
    right: Math.round(g.width * 0.95),
    top: Math.round(g.height * 0.05),
    bottom: Math.round(g.height * 0.95),
  };
}

function innerEdge(
  profile: Float32Array,
  outerPos: number,
  cardSpan: number,
  dir: 1 | -1,
): number {
  const gap = Math.max(2, Math.round(cardSpan * 0.02));
  const reach = Math.max(gap + 2, Math.round(cardSpan * 0.22));
  const from = outerPos + dir * gap;
  const to = outerPos + dir * reach;
  const lo = Math.max(0, Math.min(from, to));
  const hi = Math.min(profile.length - 1, Math.max(from, to));
  if (lo >= hi) return -1;
  const localMax = maxOf(profile, lo, hi);
  if (localMax <= 0) return -1;
  const found = firstPeakFrom(profile, from, dir > 0 ? hi : lo, localMax * 0.6);
  return found < 0 ? -1 : found + (dir > 0 ? 1 : 0);
}

/** Border widths → grader-style splits that always sum to 100 per axis. */
export function computeSplits(result: CenteringResult): Splits {
  const lw = Math.max(0, result.inner.left - result.outer.left);
  const rw = Math.max(0, result.outer.right - result.inner.right);
  const tw = Math.max(0, result.inner.top - result.outer.top);
  const bw = Math.max(0, result.outer.bottom - result.inner.bottom);
  return {
    leftRight: pairSplit(lw, rw),
    topBottom: pairSplit(tw, bw),
  };
}

function pairSplit(a: number, b: number): [number, number] {
  if (a + b <= 0) return [50, 50];
  const first = Math.round((a / (a + b)) * 100);
  return [first, 100 - first];
}

/**
 * Approximate grading guidance from the worst axis. Public grading-company
 * guidelines are ranges, and real grades weigh more than centering — this is
 * explicitly a rough, front-only estimate for the UI to label as such.
 */
export function centeringGuidance(splits: Splits): {
  worst: number;
  label: string;
} {
  const worst = Math.max(
    Math.abs(splits.leftRight[0] - 50),
    Math.abs(splits.topBottom[0] - 50),
  );
  let label: string;
  if (worst <= 5) label = 'Within typical PSA 10 range';
  else if (worst <= 10) label = 'Within typical PSA 9 range';
  else if (worst <= 15) label = 'Within typical PSA 8 range';
  else label = 'Outside typical PSA 8 range';
  return { worst, label };
}
