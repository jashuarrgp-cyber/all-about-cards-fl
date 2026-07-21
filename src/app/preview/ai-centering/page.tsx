import type { Metadata } from 'next';
import { MobileFrame } from '@/components/app/mobile-frame';
import { TopTabs } from '@/components/app/top-tabs';
import { CenteringScreen } from '@/components/centering/centering-screen';

// Public, unauthenticated preview of the AI Centering flow. Analysis runs
// entirely in the browser on the visitor's own photo — no data is stored.

export const metadata: Metadata = {
  title: 'AI Centering preview — All About Cards FL',
  robots: { index: false, follow: false },
};

export default function CenteringPreviewPage() {
  return (
    <MobileFrame>
      <div className="rounded-b-2xl bg-brand-teal/10 px-4 py-1.5 text-center text-[11px] font-medium text-brand-teal">
        Design preview
      </div>
      <TopTabs active="ai-centering" />
      <CenteringScreen />
    </MobileFrame>
  );
}
