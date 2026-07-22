import Link from 'next/link';

// Top segmented navigation shown across the portfolio area
// (Portfolio · Market · AI Centering), mirroring the collector app layout.
// In `preview` mode the tabs link to the public `/preview/*` pages; a tab
// with no preview page (Market) is shown disabled so it can't dead-end the
// visitor at a sign-in screen.

const TABS = [
  {
    key: 'portfolio',
    label: 'Portfolio',
    href: '/app/portfolio',
    previewHref: '/preview/portfolio',
  },
  { key: 'market', label: 'Market', href: '/app/market' },
  {
    key: 'ai-centering',
    label: 'AI Centering',
    href: '/app/ai-centering',
    previewHref: '/preview/ai-centering',
  },
] as const;

export type TopTabKey = (typeof TABS)[number]['key'];

export function TopTabs({
  active,
  preview = false,
}: {
  active: TopTabKey;
  preview?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 px-2">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const target = preview
          ? 'previewHref' in tab
            ? tab.previewHref
            : undefined
          : tab.href;

        const baseClass =
          'relative flex-1 px-2 py-3 text-center text-[15px] font-semibold transition';

        // In preview mode a tab with no preview page is shown but disabled.
        if (preview && !target) {
          return (
            <span
              key={tab.key}
              aria-disabled="true"
              title={`${tab.label} isn't part of this preview`}
              className={`${baseClass} text-slate-700`}
            >
              {tab.label}
            </span>
          );
        }

        return (
          <Link
            key={tab.key}
            href={target ?? tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={`${baseClass} ${
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
