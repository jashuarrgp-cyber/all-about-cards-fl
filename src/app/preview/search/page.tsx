import type { Metadata } from 'next';
import { MobileFrame } from '@/components/app/mobile-frame';
import { SearchScreen } from '@/components/search/search-screen';

// Public, unauthenticated preview of live card search. This calls the real
// pricing API route (public card names and public market prices only — no
// account or business data), so what you see here is real, not sample.

export const metadata: Metadata = {
  title: 'Search preview — All About Cards FL',
  robots: { index: false, follow: false },
};

export default function SearchPreviewPage() {
  return (
    <MobileFrame>
      <div className="rounded-b-2xl bg-brand-teal/10 px-4 py-1.5 text-center text-[11px] font-medium text-brand-teal">
        Design preview · live prices
      </div>
      <SearchScreen />
    </MobileFrame>
  );
}
