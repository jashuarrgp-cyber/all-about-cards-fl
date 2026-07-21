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

function CountStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold tabular-nums text-white">
        {formatCount(value)}
      </div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
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
        <div className="grid grid-cols-3 gap-2 rounded-3xl border border-white/5 bg-white/[0.03] py-5">
          <CountStat label="Raw" value={data.counts.raw} />
          <CountStat label="Graded" value={data.counts.graded} />
          <CountStat label="Sealed" value={data.counts.sealed} />
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-500">
          {data.countsAreLive
            ? 'Live counts from your inventory.'
            : 'Sample counts — connects to your live inventory automatically.'}
        </p>
      </section>

      <section>
        <SectionLabel>Most Valuable</SectionLabel>
        <div className="-mx-5 mt-4 flex gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {data.mostValuable.map((item) => (
            <div key={item.id} className="w-32 shrink-0">
              <div
                className="flex h-40 items-end rounded-2xl p-3"
                style={{
                  background: `linear-gradient(160deg, ${item.imageColor}cc, ${item.imageColor}66)`,
                }}
              >
                <span className="text-xs font-medium leading-tight text-white/90 line-clamp-3">
                  {item.name}
                </span>
              </div>
              <div className="mt-2 text-base font-bold tabular-nums text-white">
                {formatUsd0(item.value)}
              </div>
              <div className="truncate text-xs text-slate-500">
                {item.subtitle}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>Breakdown</SectionLabel>
        <div className="mt-4 rounded-3xl border border-white/5 bg-white/[0.03] p-5">
          <BreakdownDonut slices={data.breakdown} />
        </div>
      </section>
    </div>
  );
}
