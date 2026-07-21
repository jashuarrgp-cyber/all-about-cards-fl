import type { Metadata } from 'next';
import { MobileFrame } from '@/components/app/mobile-frame';
import { CollectionScreen } from '@/components/collection/collection-screen';
import { sampleCollection } from '@/lib/collection/sample';

// Public, unauthenticated preview of the Collection tab using sample data
// only — same component as the real /app/collection screen. Never touches
// live data, cost, or profit.

export const metadata: Metadata = {
  title: 'Collection preview — All About Cards FL',
  robots: { index: false, follow: false },
};

export default function CollectionPreviewPage() {
  return (
    <MobileFrame>
      <div className="rounded-b-2xl bg-brand-pink/10 px-4 py-1.5 text-center text-[11px] font-medium text-brand-pink">
        Design preview · sample data
      </div>
      <CollectionScreen data={sampleCollection} scanHref="/preview/scan" />
    </MobileFrame>
  );
}
