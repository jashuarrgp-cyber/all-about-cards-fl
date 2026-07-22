'use client';

import { useId, useMemo, useState } from 'react';
import type { Timeframe, ValueSeries } from '@/lib/portfolio/types';
import {
  formatSignedPct,
  formatSignedUsd0,
  formatUsd0,
  formatUsd2,
} from '@/lib/format';

const TIMEFRAMES: Timeframe[] = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];
const LABELS: Record<Timeframe, string> = {
  '1W': '1W',
  '1M': '1M',
  '3M': '3M',
  '6M': '6M',
  '1Y': '1Y',
  ALL: 'All',
};

const W = 100;
const H = 42;
const PAD_Y = 4;

function buildPaths(series: ValueSeries) {
  const values = series.points.map((p) => p.v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const n = values.length;

  const coords = values.map((v, i) => {
    const x = (i / (n - 1)) * W;
    const y = PAD_Y + (H - 2 * PAD_Y) * (1 - (v - min) / span);
    return { x, y };
  });

  const line = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(2)},${c.y.toFixed(2)}`)
    .join(' ');
  const area = `${line} L${W},${H} L0,${H} Z`;

  const highIndex = values.indexOf(max);
  return { line, area, high: coords[highIndex], highValue: max };
}

export function ValueChart({
  total,
  series,
  isSample,
}: {
  total: number;
  series: Record<Timeframe, ValueSeries>;
  isSample: boolean;
}) {
  const [timeframe, setTimeframe] = useState<Timeframe>('1W');
  const gradientId = useId();
  const active = series[timeframe];
  const { line, area, high, highValue } = useMemo(
    () => buildPaths(active),
    [active],
  );
  const up = active.changeAbs >= 0;

  return (
    <div>
      <div className="text-center">
        <div className="text-[44px] font-bold leading-none tracking-tight text-white tabular-nums">
          {formatUsd2(total)}
        </div>
        <div
          className={`mt-2 text-base font-medium tabular-nums ${
            up ? 'text-brand-up' : 'text-brand-down'
          }`}
        >
          {formatSignedUsd0(active.changeAbs)} (
          {formatSignedPct(active.changePct)})
        </div>
      </div>

      <div className="relative mt-5">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-44 w-full overflow-visible"
          role="img"
          aria-label={`Portfolio value trend over ${LABELS[timeframe]}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={up ? '#00f5a0' : '#ff3b5c'}
                stopOpacity="0.28"
              />
              <stop
                offset="100%"
                stopColor={up ? '#00f5a0' : '#ff3b5c'}
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gradientId})`} />
          <path
            d={line}
            fill="none"
            stroke={up ? '#00f5a0' : '#ff3b5c'}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <circle
            cx={high.x}
            cy={high.y}
            r={1.6}
            fill="#0a0616"
            stroke={up ? '#00f5a0' : '#ff3b5c'}
            strokeWidth={1.4}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div
          className={`pointer-events-none absolute -translate-y-full ${
            high.x >= 70
              ? 'text-right'
              : high.x <= 30
                ? 'text-left'
                : '-translate-x-1/2 text-center'
          }`}
          style={
            high.x >= 70
              ? { right: `${100 - high.x}%`, top: `${(high.y / H) * 100}%` }
              : { left: `${high.x}%`, top: `${(high.y / H) * 100}%` }
          }
        >
          <div className="text-[10px] uppercase tracking-wide text-slate-500">
            High
          </div>
          <div className="text-xs font-medium text-slate-300 tabular-nums">
            {formatUsd0(highValue)}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between px-1">
        {TIMEFRAMES.map((tf) => {
          const selected = tf === timeframe;
          return (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              aria-pressed={selected}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                selected
                  ? 'bg-white/10 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {LABELS[tf]}
            </button>
          );
        })}
      </div>

      {isSample && (
        <p className="mt-3 text-center text-[11px] text-slate-500">
          Sample values — live market pricing arrives in a later phase.
        </p>
      )}
    </div>
  );
}
