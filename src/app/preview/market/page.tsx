import type { Metadata } from 'next';
import { MobileFrame } from '@/components/app/mobile-frame';
import { TopTabs } from '@/components/app/top-tabs';
import { ComingSoon } from '@/components/app/coming-soon';
import { ChartIcon } from '@/components/app/icons';

// Public, no-login preview of the Market tab (currently a placeholder), so
// every tab in the app is walkable from the design preview.

export const metadata: Metadata = {
  title: 'Market preview — All About Cards FL',
  robots: { index: false, follow: false },
};

export default function MarketPreviewPage() {
  return (
    <MobileFrame preview>
      <div className="rounded-b-2xl bg-brand-pink/10 px-4 py-1.5 text-center text-[11px] font-medium text-brand-pink">
        Design preview
      </div>
      <TopTabs active="market" preview />
      <ComingSoon
        title="Market"
        description="Market movers, grading plays, and trending cards will live here. We're wiring up live pricing sources in a later phase."
        icon={<ChartIcon />}
      />
    </MobileFrame>
  );
}
