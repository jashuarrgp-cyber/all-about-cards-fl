import type { Metadata } from 'next';
import { MobileFrame } from '@/components/app/mobile-frame';
import { TopTabs } from '@/components/app/top-tabs';
import { PortfolioScreen } from '@/components/portfolio/portfolio-screen';
import { sampleSnapshot } from '@/lib/portfolio/sample';

// Public, unauthenticated preview of the portfolio dashboard using sample data
// only. It renders the exact same component as the real /app/portfolio screen,
// so the look here matches production. It never touches live data, cost, or
// profit — it exists purely to preview the design.

export const metadata: Metadata = {
  title: 'Portfolio preview — All About Cards FL',
  robots: { index: false, follow: false },
};

export default function PortfolioPreviewPage() {
  return (
    <MobileFrame>
      <div className="rounded-b-2xl bg-brand-teal/10 px-4 py-1.5 text-center text-[11px] font-medium text-brand-teal">
        Design preview · sample data
      </div>
      <TopTabs active="portfolio" />
      <div className="pt-6">
        <PortfolioScreen data={sampleSnapshot} />
      </div>
    </MobileFrame>
  );
}
