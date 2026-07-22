import type { BreakdownSlice } from '@/lib/portfolio/types';
import { formatUsd0 } from '@/lib/format';

// Simple SVG donut. Renders each slice as a stroked arc segment using
// stroke-dasharray on a circle. Server component — no interactivity needed.

const SIZE = 132;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;

export function BreakdownDonut({ slices }: { slices: BreakdownSlice[] }) {
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;

  let offset = 0;
  const arcs = slices.map((slice) => {
    const fraction = slice.value / total;
    const dash = fraction * CIRC;
    const arc = {
      color: slice.color,
      dasharray: `${dash} ${CIRC - dash}`,
      dashoffset: -offset,
      key: slice.label,
    };
    offset += dash;
    return arc;
  });

  return (
    <div className="flex items-center gap-6">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="shrink-0"
        role="img"
        aria-label="Portfolio value breakdown by product type"
      >
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#2c1c49"
            strokeWidth={STROKE}
          />
          {arcs.map((arc) => (
            <circle
              key={arc.key}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={arc.color}
              strokeWidth={STROKE}
              strokeDasharray={arc.dasharray}
              strokeDashoffset={arc.dashoffset}
              strokeLinecap="butt"
            />
          ))}
        </g>
      </svg>

      <ul className="min-w-0 flex-1 space-y-3">
        {slices.map((slice) => (
          <li key={slice.label} className="flex items-center gap-3">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="min-w-0 flex-1 truncate text-sm text-slate-300">
              {slice.label}
            </span>
            <span className="text-sm font-semibold tabular-nums text-white">
              {formatUsd0(slice.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
