import type { PortfolioSnapshot } from '@/lib/portfolio/types';
import { formatCount, formatUsd0 } from '@/lib/format';
import { ValueChart } from './value-chart';
import { BreakdownDonut } from './breakdown-donut';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
      {children}
    </h2>
  );
}

function CountPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-full border border-white/5 bg-white/[0.03] px-4 py-2">
      <span className="text-base font-bold tabular-nums text-white">
        {formatCount(value)}
      </span>
      <span className="text-xs text-slate-500">{label}</span>
    </span>
  );
}

export function PortfolioScreen({ data }: { data: PortfolioSnapshot }) {
  return (
    <div className="space-y-8 pb-6">
      <section>
        <ValueChart
          total={data.totalValue}
          series={data.series}
          isSample={data.valuesAreSample}
        />
      </section>

      <section>
        <div className="flex flex-wrap justify-center gap-2">
          <CountPill label="Raw" value={data.counts.raw} />
          <CountPill label="Graded" value={data.counts.graded} />
          <CountPill label="Sealed" value={data.counts.sealed} />
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-500">
          {data.countsAreLive
            ? 'Live counts from your inventory.'
            : 'Sample counts — connects to your live inventory automatically.'}
        </p>
      </section>

      <section>
        <SectionLabel>Breakdown</SectionLabel>
        <div className="mt-4 rounded-3xl border border-white/5 bg-white/[0.03] p-5">
          <BreakdownDonut slices={data.breakdown} />
        </div>
      </section>

      <section>
        <SectionLabel>Most Valuable</SectionLabel>
        <div className="mt-4 space-y-2">
          {data.mostValuable.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3"
            >
              <div
                className="h-12 w-12 shrink-0 rounded-xl"
                style={{
                  background: `linear-gradient(160deg, ${item.imageColor}cc, ${item.imageColor}66)`,
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">
                  {item.name}
                </div>
                <div className="truncate text-xs text-slate-500">
                  {item.subtitle}
                </div>
              </div>
              <div className="shrink-0 text-sm font-bold tabular-nums text-white">
                {formatUsd0(item.value)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
