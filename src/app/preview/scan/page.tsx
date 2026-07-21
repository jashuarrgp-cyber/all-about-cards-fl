import type { Metadata } from 'next';
import { MobileFrame } from '@/components/app/mobile-frame';
import { ScanScreen } from '@/components/scan/scan-screen';

// Public, unauthenticated preview of the card scan flow using the sample
// catalog and sample prices (labeled in the UI).

export const metadata: Metadata = {
  title: 'Card scan preview — All About Cards FL',
  robots: { index: false, follow: false },
};

export default function ScanPreviewPage() {
  return (
    <MobileFrame>
      <div className="rounded-b-2xl bg-brand-pink/10 px-4 py-1.5 text-center text-[11px] font-medium text-brand-pink">
        Design preview · sample data
      </div>
      <ScanScreen />
    </MobileFrame>
  );
}
