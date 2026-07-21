import { describe, expect, it } from 'vitest';
import {
  centeringGuidance,
  computeSplits,
  detectCardEdges,
  toGrayImage,
  type GrayImage,
} from '@/lib/centering/analysis';

// Builds a synthetic photo: dark background, bright card, and a dark inner
// frame line — the shape of a real card photo, with known-good edges.
function syntheticCard(opts: {
  width: number;
  height: number;
  outer: { left: number; right: number; top: number; bottom: number };
  inner: { left: number; right: number; top: number; bottom: number };
}): GrayImage {
  const { width, height, outer, inner } = opts;
  const values = new Float32Array(width * height).fill(25); // background
  for (let y = outer.top; y < outer.bottom; y += 1) {
    for (let x = outer.left; x < outer.right; x += 1) {
      values[y * width + x] = 235; // card surface
    }
  }
  // Inner frame: 2px dark line around the art box.
  for (let y = inner.top; y < inner.bottom; y += 1) {
    for (let x = inner.left; x < inner.right; x += 1) {
      const onFrame =
        x < inner.left + 2 ||
        x >= inner.right - 2 ||
        y < inner.top + 2 ||
        y >= inner.bottom - 2;
      if (onFrame) values[y * width + x] = 45;
    }
  }
  return { width, height, values };
}

describe('centering analysis', () => {
  const outer = { left: 20, right: 180, top: 20, bottom: 260 };
  const inner = { left: 36, right: 168, top: 38, bottom: 246 };
  const image = syntheticCard({ width: 200, height: 280, outer, inner });

  it('detects outer card edges within tolerance', () => {
    const result = detectCardEdges(image);
    expect(Math.abs(result.outer.left - outer.left)).toBeLessThanOrEqual(2);
    expect(Math.abs(result.outer.right - outer.right)).toBeLessThanOrEqual(2);
    expect(Math.abs(result.outer.top - outer.top)).toBeLessThanOrEqual(2);
    expect(Math.abs(result.outer.bottom - outer.bottom)).toBeLessThanOrEqual(2);
  });

  it('detects the inner frame within tolerance', () => {
    const result = detectCardEdges(image);
    expect(Math.abs(result.inner.left - inner.left)).toBeLessThanOrEqual(3);
    expect(Math.abs(result.inner.right - inner.right)).toBeLessThanOrEqual(3);
    expect(Math.abs(result.inner.top - inner.top)).toBeLessThanOrEqual(3);
    expect(Math.abs(result.inner.bottom - inner.bottom)).toBeLessThanOrEqual(3);
  });

  it('computes splits that sum to 100 and match the geometry', () => {
    // Borders: left 16 vs right 12 → 57/43; top 18 vs bottom 14 → 56/44.
    const splits = computeSplits({ outer, inner });
    expect(splits.leftRight[0] + splits.leftRight[1]).toBe(100);
    expect(splits.topBottom[0] + splits.topBottom[1]).toBe(100);
    expect(splits.leftRight).toEqual([57, 43]);
    expect(splits.topBottom).toEqual([56, 44]);
  });

  it('handles a perfectly centered card', () => {
    const splits = computeSplits({
      outer: { left: 10, right: 190, top: 10, bottom: 270 },
      inner: { left: 24, right: 176, top: 24, bottom: 256 },
    });
    expect(splits.leftRight).toEqual([50, 50]);
    expect(splits.topBottom).toEqual([50, 50]);
    expect(centeringGuidance(splits).label).toContain('PSA 10');
  });

  it('grades guidance by the worst axis', () => {
    expect(
      centeringGuidance({ leftRight: [58, 42], topBottom: [51, 49] }).label,
    ).toContain('PSA 9');
    expect(
      centeringGuidance({ leftRight: [65, 35], topBottom: [50, 50] }).label,
    ).toContain('PSA 8');
    expect(
      centeringGuidance({ leftRight: [70, 30], topBottom: [50, 50] }).label,
    ).toContain('Outside');
  });

  it('degrades gracefully on an empty image', () => {
    const flat: GrayImage = {
      width: 100,
      height: 140,
      values: new Float32Array(100 * 140).fill(128),
    };
    const result = detectCardEdges(flat);
    // Fallback rectangles are usable and properly nested.
    expect(result.outer.left).toBeLessThan(result.inner.left);
    expect(result.inner.left).toBeLessThan(result.inner.right);
    expect(result.inner.right).toBeLessThan(result.outer.right);
  });

  it('converts RGBA to grayscale', () => {
    const rgba = new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255]);
    const g = toGrayImage(rgba, 2, 1);
    expect(g.values[0]).toBeCloseTo(255, 0);
    expect(g.values[1]).toBeCloseTo(0, 0);
  });
});
