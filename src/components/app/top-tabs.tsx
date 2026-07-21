import Link from 'next/link';

// Top segmented navigation shown across the portfolio area
// (Portfolio · Market · AI Centering), mirroring the collector app layout.

const TABS = [
  { key: 'portfolio', label: 'Portfolio', href: '/app/portfolio' },
  { key: 'market', label: 'Market', href: '/app/market' },
  { key: 'ai-centering', label: 'AI Centering', href: '/app/ai-centering' },
] as const;

export type TopTabKey = (typeof TABS)[number]['key'];

export function TopTabs({ active }: { active: TopTabKey }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 px-2">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={`relative flex-1 px-2 py-3 text-center text-[15px] font-semibold transition ${
              isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
            {isActive && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-white" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
